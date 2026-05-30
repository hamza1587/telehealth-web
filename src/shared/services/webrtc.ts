import { Room, RoomEvent, Track, ConnectionState, Participant } from 'livekit-client';

export interface CallSession {
  id: string;
  roomId: string;
  participants: Participant[];
  startTime: Date;
  isRecording: boolean;
}

export class WebRTCService {
  private room: Room | null = null;
  private token: string = '';
  private serverUrl: string = '';

  async connect(token: string, serverUrl: string): Promise<Room> {
    this.token = token;
    this.serverUrl = serverUrl;

    this.room = new Room({
      adaptiveStream: true,
      dynacast: true,
    });

    this.room.on(RoomEvent.Connected, () => {
      console.log('Connected to room');
    });

    this.room.on(RoomEvent.Disconnected, () => {
      console.log('Disconnected from room');
    });

    this.room.on(RoomEvent.ParticipantConnected, (participant: Participant) => {
      console.log('Participant connected:', participant.identity);
    });

    this.room.on(RoomEvent.ParticipantDisconnected, (participant: Participant) => {
      console.log('Participant disconnected:', participant.identity);
    });

    await this.room.connect(this.serverUrl, this.token);
    return this.room;
  }

  async disconnect(): Promise<void> {
    if (this.room) {
      await this.room.disconnect();
      this.room = null;
    }
  }

  async enableCamera(): Promise<void> {
    if (this.room) {
      await this.room.localParticipant.setCameraEnabled(true);
    }
  }

  async disableCamera(): Promise<void> {
    if (this.room) {
      await this.room.localParticipant.setCameraEnabled(false);
    }
  }

  async enableMicrophone(): Promise<void> {
    if (this.room) {
      await this.room.localParticipant.setMicrophoneEnabled(true);
    }
  }

  async disableMicrophone(): Promise<void> {
    if (this.room) {
      await this.room.localParticipant.setMicrophoneEnabled(false);
    }
  }

  async shareScreen(): Promise<void> {
    if (this.room) {
      await this.room.localParticipant.setScreenShareEnabled(true);
    }
  }

  async stopScreenShare(): Promise<void> {
    if (this.room) {
      await this.room.localParticipant.setScreenShareEnabled(false);
    }
  }

  getLocalParticipant(): Participant | null {
    return this.room?.localParticipant ?? null;
  }

  getRemoteParticipants(): Participant[] {
    return this.room ? Array.from(this.room.remoteParticipants.values()) : [];
  }

  getConnectionState(): ConnectionState {
    return this.room?.state ?? ConnectionState.Disconnected;
  }

  onConnectionStateChanged(callback: (state: ConnectionState) => void): void {
    if (this.room) {
      this.room.on(RoomEvent.ConnectionStateChanged, callback);
    }
  }

  onParticipantConnected(callback: (participant: Participant) => void): void {
    if (this.room) {
      this.room.on(RoomEvent.ParticipantConnected, callback);
    }
  }

  onParticipantDisconnected(callback: (participant: Participant) => void): void {
    if (this.room) {
      this.room.on(RoomEvent.ParticipantDisconnected, callback);
    }
  }
}

export const webrtcService = new WebRTCService();