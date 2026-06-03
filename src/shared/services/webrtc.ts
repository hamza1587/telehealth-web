import {
  Room,
  RoomEvent,
  ConnectionState,
  Track,
} from 'livekit-client'
import type {
  Participant,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  LocalTrack,
  LocalTrackPublication,
} from 'livekit-client'

export interface TokenResponse {
  token: string
  serverUrl: string
  roomName: string
  callSessionId: string
}

export type TrackSubscribedCallback = (
  track: RemoteTrack,
  publication: RemoteTrackPublication,
  participant: RemoteParticipant
) => void

export type TrackUnsubscribedCallback = (
  track: RemoteTrack,
  publication: RemoteTrackPublication,
  participant: RemoteParticipant
) => void

export type ParticipantCallback = (participant: RemoteParticipant) => void
export type ConnectionStateCallback = (state: ConnectionState) => void
export type ActiveSpeakerCallback = (speakers: Participant[]) => void

export class WebRTCService {
  private room: Room | null = null
  private videoServiceUrl: string

  constructor(videoServiceUrl?: string) {
    this.videoServiceUrl = videoServiceUrl ?? import.meta.env.VITE_VIDEO_SERVICE_URL ?? 'http://localhost:5003'
  }

  // ── Token acquisition ─────────────────────────────────────────────────────

  async fetchRoomToken(consultationId: string, participantIdentity: string): Promise<TokenResponse> {
    const authTokens = localStorage.getItem('authTokens')
    const accessToken = authTokens ? (JSON.parse(authTokens) as { accessToken?: string }).accessToken : null

    const response = await fetch(`${this.videoServiceUrl}/api/rtc/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ consultationId, participantIdentity }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' })) as { error?: string }
      throw new Error(error.error ?? `Failed to get room token (${response.status})`)
    }

    return response.json() as Promise<TokenResponse>
  }

  // ── Connection lifecycle ──────────────────────────────────────────────────

  async joinRoom(consultationId: string, participantIdentity: string): Promise<Room> {
    const { token, serverUrl } = await this.fetchRoomToken(consultationId, participantIdentity)
    return this.connect(token, serverUrl)
  }

  async connect(token: string, serverUrl: string): Promise<Room> {
    if (this.room) {
      await this.disconnect()
    }

    this.room = new Room({
      adaptiveStream: true,
      dynacast: true,
      stopLocalTrackOnUnpublish: true,
    })

    await this.room.connect(serverUrl, token)
    return this.room
  }

  async disconnect(): Promise<void> {
    if (this.room) {
      await this.room.disconnect()
      this.room = null
    }
  }

  // ── Local media controls ──────────────────────────────────────────────────

  async enableCamera(): Promise<void> {
    await this.room?.localParticipant.setCameraEnabled(true)
  }

  async disableCamera(): Promise<void> {
    await this.room?.localParticipant.setCameraEnabled(false)
  }

  async toggleCamera(): Promise<boolean> {
    const enabled = this.isCameraEnabled()
    if (enabled) {
      await this.disableCamera()
    } else {
      await this.enableCamera()
    }
    return !enabled
  }

  async enableMicrophone(): Promise<void> {
    await this.room?.localParticipant.setMicrophoneEnabled(true)
  }

  async disableMicrophone(): Promise<void> {
    await this.room?.localParticipant.setMicrophoneEnabled(false)
  }

  async toggleMicrophone(): Promise<boolean> {
    const enabled = this.isMicrophoneEnabled()
    if (enabled) {
      await this.disableMicrophone()
    } else {
      await this.enableMicrophone()
    }
    return !enabled
  }

  async shareScreen(): Promise<void> {
    await this.room?.localParticipant.setScreenShareEnabled(true)
  }

  async stopScreenShare(): Promise<void> {
    await this.room?.localParticipant.setScreenShareEnabled(false)
  }

  async toggleScreenShare(): Promise<boolean> {
    const enabled = this.isScreenSharing()
    if (enabled) {
      await this.stopScreenShare()
    } else {
      await this.shareScreen()
    }
    return !enabled
  }

  // ── Local track state ─────────────────────────────────────────────────────

  isCameraEnabled(): boolean {
    return this.room?.localParticipant.isCameraEnabled ?? false
  }

  isMicrophoneEnabled(): boolean {
    return this.room?.localParticipant.isMicrophoneEnabled ?? false
  }

  isScreenSharing(): boolean {
    return this.room?.localParticipant.isScreenShareEnabled ?? false
  }

  getLocalTracks(): LocalTrack[] {
    return (this.room?.localParticipant.getTrackPublications() as LocalTrackPublication[] | undefined)
      ?.filter((pub): pub is LocalTrackPublication & { track: LocalTrack } => pub.track !== undefined)
      .map(pub => pub.track) ?? []
  }

  getLocalVideoTrack(): LocalTrack | null {
    const pub = this.room?.localParticipant.getTrackPublication(Track.Source.Camera) as LocalTrackPublication | undefined
    return pub?.track ?? null
  }

  // ── Participant access ────────────────────────────────────────────────────

  getLocalParticipant(): Participant | null {
    return this.room?.localParticipant ?? null
  }

  getRemoteParticipants(): RemoteParticipant[] {
    return this.room ? Array.from(this.room.remoteParticipants.values()) : []
  }

  getAllParticipants(): Participant[] {
    const participants: Participant[] = []
    if (this.room?.localParticipant) {
      participants.push(this.room.localParticipant)
    }
    participants.push(...this.getRemoteParticipants())
    return participants
  }

  // ── Connection state ──────────────────────────────────────────────────────

  getConnectionState(): ConnectionState {
    return this.room?.state ?? ConnectionState.Disconnected
  }

  isConnected(): boolean {
    return this.room?.state === ConnectionState.Connected
  }

  getRoomName(): string | null {
    return this.room?.name ?? null
  }

  // ── Event subscriptions (return cleanup functions) ────────────────────────

  onConnectionStateChanged(callback: ConnectionStateCallback): () => void {
    if (!this.room) return () => { }
    this.room.on(RoomEvent.ConnectionStateChanged, callback)
    return () => this.room?.off(RoomEvent.ConnectionStateChanged, callback)
  }

  onParticipantConnected(callback: ParticipantCallback): () => void {
    if (!this.room) return () => { }
    this.room.on(RoomEvent.ParticipantConnected, callback)
    return () => this.room?.off(RoomEvent.ParticipantConnected, callback)
  }

  onParticipantDisconnected(callback: ParticipantCallback): () => void {
    if (!this.room) return () => { }
    this.room.on(RoomEvent.ParticipantDisconnected, callback)
    return () => this.room?.off(RoomEvent.ParticipantDisconnected, callback)
  }

  onTrackSubscribed(callback: TrackSubscribedCallback): () => void {
    if (!this.room) return () => { }
    this.room.on(RoomEvent.TrackSubscribed, callback)
    return () => this.room?.off(RoomEvent.TrackSubscribed, callback)
  }

  onTrackUnsubscribed(callback: TrackUnsubscribedCallback): () => void {
    if (!this.room) return () => { }
    this.room.on(RoomEvent.TrackUnsubscribed, callback)
    return () => this.room?.off(RoomEvent.TrackUnsubscribed, callback)
  }

  onActiveSpeakersChanged(callback: ActiveSpeakerCallback): () => void {
    if (!this.room) return () => { }
    this.room.on(RoomEvent.ActiveSpeakersChanged, callback)
    return () => this.room?.off(RoomEvent.ActiveSpeakersChanged, callback)
  }

  onDisconnected(callback: () => void): () => void {
    if (!this.room) return () => { }
    this.room.on(RoomEvent.Disconnected, callback)
    return () => this.room?.off(RoomEvent.Disconnected, callback)
  }

  onReconnecting(callback: () => void): () => void {
    if (!this.room) return () => { }
    this.room.on(RoomEvent.Reconnecting, callback)
    return () => this.room?.off(RoomEvent.Reconnecting, callback)
  }

  onReconnected(callback: () => void): () => void {
    if (!this.room) return () => { }
    this.room.on(RoomEvent.Reconnected, callback)
    return () => this.room?.off(RoomEvent.Reconnected, callback)
  }

  // ── Room reference ────────────────────────────────────────────────────────

  getRoom(): Room | null {
    return this.room
  }
}

export const webrtcService = new WebRTCService()
