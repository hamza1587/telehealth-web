import { useRef, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material'
import {
  MicIcon,
  MicOffIcon,
  VideocamIcon,
  VideocamOffIcon,
  ScreenShareIcon,
  CallEndIcon,
  PauseIcon,
  PlayArrowIcon,
} from '@mui/icons-material'
import type { ConsultationSession } from '@shared/types/consultation.ts'

interface ConsultationRoomProps {
  session: ConsultationSession | null
  sessionToken: { roomUrl: string; token: string } | null
  billableSeconds: number
  onEndSession: () => void
}

export function ConsultationRoom({
  session,
  sessionToken,
  billableSeconds,
  onEndSession,
}: ConsultationRoomProps) {
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [screenSharing, setScreenSharing] = useState(false)
  const [paused, setPaused] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const calculateCost = () => {
    if (!session) return '0.00'
    const cost = (billableSeconds * session.pricePerSecond) / 100
    return cost.toFixed(2)
  }

  if (!session) {
    return (
      <Alert severity="info">
        No active consultation session. Please join an appointment.
      </Alert>
    )
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Consultation with Dr. {session.doctorId}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={`Time: ${formatTime(billableSeconds)}`}
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`Cost: ${calculateCost()} ${session.currency}`}
              color="secondary"
              variant="outlined"
            />
          </Box>
        </Box>

        <Box
          sx={{
            position: 'relative',
            backgroundColor: 'black',
            borderRadius: 1,
            mb: 2,
            minHeight: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {sessionToken ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={!audioEnabled}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <CircularProgress />
          )}

          {!videoEnabled && (
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white',
                p: 1,
                borderRadius: 1,
              }}
            >
              <Typography variant="caption">Video paused</Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
          <IconButton
            color={audioEnabled ? 'primary' : 'error'}
            onClick={() => setAudioEnabled(!audioEnabled)}
            size="large"
          >
            {audioEnabled ? <MicIcon /> : <MicOffIcon />}
          </IconButton>

          <IconButton
            color={videoEnabled ? 'primary' : 'error'}
            onClick={() => setVideoEnabled(!videoEnabled)}
            size="large"
          >
            {videoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
          </IconButton>

          <IconButton
            color={screenSharing ? 'secondary' : 'default'}
            onClick={() => setScreenSharing(!screenSharing)}
            size="large"
          >
            <ScreenShareIcon />
          </IconButton>

          <IconButton
            color={paused ? 'warning' : 'default'}
            onClick={() => setPaused(!paused)}
            size="large"
          >
            {paused ? <PlayArrowIcon /> : <PauseIcon />}
          </IconButton>

          <IconButton
            color="error"
            onClick={onEndSession}
            size="large"
            sx={{ backgroundColor: 'error.light' }}
          >
            <CallEndIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setAudioEnabled(!audioEnabled)}
          >
            {audioEnabled ? 'Mute Audio' : 'Unmute Audio'}
          </Button>
          <Button
            variant="outlined"
            onClick={() => setVideoEnabled(!videoEnabled)}
          >
            {videoEnabled ? 'Turn Off Video' : 'Turn On Video'}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={onEndSession}
          >
            End Consultation
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}
