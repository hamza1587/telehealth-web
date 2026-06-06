import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Box, Grid, Typography, IconButton, Tooltip, Paper, Stack,
  Chip, Badge, Drawer, List, ListItem, ListItemAvatar, Avatar,
  ListItemText, Divider, TextField, Button, CircularProgress,
  Alert,
} from '@mui/material'
import {
  Mic as MicIcon, MicOff as MicOffIcon,
  Videocam as CamIcon, VideocamOff as CamOffIcon,
  ScreenShare as ScreenShareIcon, StopScreenShare as StopScreenShareIcon,
  CallEnd as HangUpIcon,
  People as PeopleIcon,
  Chat as ChatIcon,
  Brush as WhiteboardIcon,
  Close as CloseIcon,
  Send as SendIcon,
} from '@mui/icons-material'
import {
  Room,
  RoomEvent,
  RemoteParticipant,
  LocalParticipant,
  Track,
  VideoPresets,
  createLocalTracks,
  type LocalTrack,
} from 'livekit-client'
import { WhiteboardPanel } from './WhiteboardPanel.tsx'

interface ParticipantInfo {
  identity: string
  displayName: string
  isMuted: boolean
  isCameraOff: boolean
  isSpeaking: boolean
}

interface ChatMessage {
  sender: string
  text: string
  ts: number
}

interface GroupConsultationRoomProps {
  livekitUrl: string
  token: string
  roomName: string
  displayName: string
  onLeave: () => void
}

export function GroupConsultationRoom({
  livekitUrl,
  token,
  roomName,
  displayName,
  onLeave,
}: GroupConsultationRoomProps) {
  const roomRef = useRef<Room | null>(null)
  const [connecting, setConnecting] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [participants, setParticipants] = useState<ParticipantInfo[]>([])
  const [muted, setMuted] = useState(false)
  const [cameraOff, setCameraOff] = useState(false)
  const [screenSharing, setScreenSharing] = useState(false)

  const [sidePanel, setSidePanel] = useState<'none' | 'participants' | 'chat' | 'whiteboard'>('none')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [unreadChat, setUnreadChat] = useState(0)

  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map())

  const participantToInfo = useCallback((p: LocalParticipant | RemoteParticipant): ParticipantInfo => ({
    identity: p.identity,
    displayName: p.name ?? p.identity,
    isMuted: !p.isMicrophoneEnabled,
    isCameraOff: !p.isCameraEnabled,
    isSpeaking: p.isSpeaking,
  }), [])

  const syncParticipants = useCallback(() => {
    if (!roomRef.current) return
    const room = roomRef.current
    const all: ParticipantInfo[] = [
      participantToInfo(room.localParticipant),
      ...Array.from(room.remoteParticipants.values()).map(participantToInfo),
    ]
    setParticipants(all)
  }, [participantToInfo])

  useEffect(() => {
    const room = new Room({
      adaptiveStream: true,
      dynacast: true,
      videoCaptureDefaults: { resolution: VideoPresets.h720.resolution },
    })
    roomRef.current = room

    room
      .on(RoomEvent.ParticipantConnected, syncParticipants)
      .on(RoomEvent.ParticipantDisconnected, syncParticipants)
      .on(RoomEvent.TrackMuted, syncParticipants)
      .on(RoomEvent.TrackUnmuted, syncParticipants)
      .on(RoomEvent.ActiveSpeakersChanged, syncParticipants)
      .on(RoomEvent.DataReceived, (payload: Uint8Array, participant) => {
        const msg = JSON.parse(new TextDecoder().decode(payload)) as ChatMessage
        setMessages(prev => [...prev, msg])
        if (sidePanel !== 'chat') setUnreadChat(n => n + 1)
      })

    room.connect(livekitUrl, token, { autoSubscribe: true })
      .then(async () => {
        await room.localParticipant.setCameraEnabled(true)
        await room.localParticipant.setMicrophoneEnabled(true)
        syncParticipants()
        setConnecting(false)
      })
      .catch(e => {
        setError(e instanceof Error ? e.message : 'Failed to connect.')
        setConnecting(false)
      })

    return () => {
      room.disconnect()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [livekitUrl, token])

  useEffect(() => {
    if (sidePanel === 'chat') setUnreadChat(0)
  }, [sidePanel])

  const toggleMic = async () => {
    if (!roomRef.current) return
    const next = !muted
    await roomRef.current.localParticipant.setMicrophoneEnabled(!next)
    setMuted(next)
  }

  const toggleCamera = async () => {
    if (!roomRef.current) return
    const next = !cameraOff
    await roomRef.current.localParticipant.setCameraEnabled(!next)
    setCameraOff(next)
  }

  const toggleScreenShare = async () => {
    if (!roomRef.current) return
    if (!screenSharing) {
      await roomRef.current.localParticipant.setScreenShareEnabled(true)
    } else {
      await roomRef.current.localParticipant.setScreenShareEnabled(false)
    }
    setScreenSharing(s => !s)
  }

  const leave = async () => {
    roomRef.current?.disconnect()
    onLeave()
  }

  const sendMessage = () => {
    if (!chatInput.trim() || !roomRef.current) return
    const msg: ChatMessage = { sender: displayName, text: chatInput.trim(), ts: Date.now() }
    const data = new TextEncoder().encode(JSON.stringify(msg))
    roomRef.current.localParticipant.publishData(data, { reliable: true })
    setMessages(prev => [...prev, msg])
    setChatInput('')
  }

  if (connecting) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, gap: 2 }}>
        <CircularProgress />
        <Typography color="text.secondary">Joining room…</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" action={<Button onClick={onLeave}>Leave</Button>}>
        {error}
      </Alert>
    )
  }

  const colCount = participants.length <= 1 ? 1 : participants.length <= 4 ? 2 : 3

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'grey.900' }}>
      {/* Header */}
      <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'grey.800' }}>
        <Typography variant="subtitle1" color="white" fontWeight="bold" sx={{ flexGrow: 1 }}>
          {roomName}
        </Typography>
        <Chip label={`${participants.length} participants`} size="small" sx={{ color: 'white', borderColor: 'grey.600' }} variant="outlined" />
      </Box>

      {/* Video grid */}
      <Box sx={{ flexGrow: 1, display: 'grid', gridTemplateColumns: `repeat(${colCount}, 1fr)`, gap: 1, p: 1 }}>
        {participants.map(p => (
          <Paper
            key={p.identity}
            sx={{
              position: 'relative',
              bgcolor: 'grey.800',
              borderRadius: 2,
              overflow: 'hidden',
              aspectRatio: '16/9',
              border: p.isSpeaking ? '2px solid' : '2px solid transparent',
              borderColor: p.isSpeaking ? 'success.main' : 'transparent',
            }}
          >
            <video
              ref={el => { if (el) videoRefs.current.set(p.identity, el) }}
              autoPlay
              playsInline
              muted={p.identity === roomRef.current?.localParticipant.identity}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {p.isCameraOff && (
              <Box sx={{
                position: 'absolute', inset: 0, display: 'flex',
                alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.700',
              }}>
                <Avatar sx={{ width: 64, height: 64, fontSize: 28 }}>
                  {p.displayName[0]?.toUpperCase()}
                </Avatar>
              </Box>
            )}
            <Box sx={{
              position: 'absolute', bottom: 8, left: 8, right: 8,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <Chip
                label={p.displayName}
                size="small"
                sx={{ bgcolor: 'rgba(0,0,0,0.6)', color: 'white', maxWidth: 150 }}
              />
              {p.isMuted && <MicOffIcon sx={{ color: 'error.main', fontSize: 18 }} />}
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Controls */}
      <Box sx={{
        py: 1.5, px: 2, bgcolor: 'grey.800',
        display: 'flex', justifyContent: 'center', gap: 1,
      }}>
        <Tooltip title={muted ? 'Unmute' : 'Mute'}>
          <IconButton onClick={toggleMic} sx={{ color: muted ? 'error.main' : 'white', bgcolor: 'grey.700', '&:hover': { bgcolor: 'grey.600' } }}>
            {muted ? <MicOffIcon /> : <MicIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title={cameraOff ? 'Enable camera' : 'Disable camera'}>
          <IconButton onClick={toggleCamera} sx={{ color: cameraOff ? 'error.main' : 'white', bgcolor: 'grey.700', '&:hover': { bgcolor: 'grey.600' } }}>
            {cameraOff ? <CamOffIcon /> : <CamIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title={screenSharing ? 'Stop sharing' : 'Share screen'}>
          <IconButton onClick={toggleScreenShare} sx={{ color: screenSharing ? 'warning.main' : 'white', bgcolor: 'grey.700', '&:hover': { bgcolor: 'grey.600' } }}>
            {screenSharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ bgcolor: 'grey.600', mx: 1 }} />

        <Tooltip title="Participants">
          <IconButton onClick={() => setSidePanel(p => p === 'participants' ? 'none' : 'participants')} sx={{ color: 'white', bgcolor: sidePanel === 'participants' ? 'primary.main' : 'grey.700' }}>
            <PeopleIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Chat">
          <IconButton onClick={() => setSidePanel(p => p === 'chat' ? 'none' : 'chat')} sx={{ color: 'white', bgcolor: sidePanel === 'chat' ? 'primary.main' : 'grey.700' }}>
            <Badge badgeContent={unreadChat} color="error">
              <ChatIcon />
            </Badge>
          </IconButton>
        </Tooltip>
        <Tooltip title="Whiteboard">
          <IconButton onClick={() => setSidePanel(p => p === 'whiteboard' ? 'none' : 'whiteboard')} sx={{ color: 'white', bgcolor: sidePanel === 'whiteboard' ? 'secondary.main' : 'grey.700' }}>
            <WhiteboardIcon />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ bgcolor: 'grey.600', mx: 1 }} />

        <Tooltip title="Leave call">
          <IconButton onClick={leave} sx={{ bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' } }}>
            <HangUpIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Side drawer */}
      <Drawer
        anchor="right"
        open={sidePanel !== 'none'}
        onClose={() => setSidePanel('none')}
        variant="persistent"
        sx={{ '& .MuiDrawer-paper': { width: 320, bgcolor: 'grey.900', color: 'white' } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', p: 1.5, borderBottom: 1, borderColor: 'grey.700' }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ flexGrow: 1 }}>
            {sidePanel === 'participants' ? 'Participants' : sidePanel === 'chat' ? 'Chat' : 'Whiteboard'}
          </Typography>
          <IconButton size="small" onClick={() => setSidePanel('none')} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {sidePanel === 'participants' && (
          <List>
            {participants.map(p => (
              <ListItem key={p.identity}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: p.isSpeaking ? 'success.main' : 'primary.main' }}>
                    {p.displayName[0]?.toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<Typography color="white">{p.displayName}</Typography>}
                  secondary={
                    <Stack direction="row" spacing={0.5} mt={0.5}>
                      {p.isMuted && <Chip label="Muted" size="small" color="error" />}
                      {p.isCameraOff && <Chip label="Cam off" size="small" color="default" />}
                      {p.isSpeaking && <Chip label="Speaking" size="small" color="success" />}
                    </Stack>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}

        {sidePanel === 'chat' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1.5 }}>
              {messages.map((m, i) => (
                <Box key={i} sx={{ mb: 1.5 }}>
                  <Typography variant="caption" color="grey.400">{m.sender}</Typography>
                  <Typography variant="body2" color="white">{m.text}</Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ p: 1.5, borderTop: 1, borderColor: 'grey.700', display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Type a message…"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                fullWidth
                sx={{ input: { color: 'white' }, fieldset: { borderColor: 'grey.600' } }}
              />
              <IconButton size="small" onClick={sendMessage} disabled={!chatInput.trim()} sx={{ color: 'primary.main' }}>
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        )}

        {sidePanel === 'whiteboard' && (
          <WhiteboardPanel roomName={roomName} />
        )}
      </Drawer>
    </Box>
  )
}
