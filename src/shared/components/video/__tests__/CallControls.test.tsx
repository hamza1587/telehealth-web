import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CallControls } from '../CallControls'

const defaultProps = {
  isMuted: false,
  isCameraOff: false,
  isScreenSharing: false,
  isRecording: false,
  onToggleMic: vi.fn(),
  onToggleCamera: vi.fn(),
  onToggleScreenShare: vi.fn(),
  onToggleRecording: vi.fn(),
  onEndCall: vi.fn(),
}

describe('CallControls', () => {
  it('renders all required controls', () => {
    render(<CallControls {...defaultProps} />)
    expect(screen.getByRole('button', { name: /mute microphone/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /turn off camera/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /share screen/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /end call/i })).toBeInTheDocument()
  })

  it('calls onToggleMic when mic button is clicked', async () => {
    const onToggleMic = vi.fn()
    render(<CallControls {...defaultProps} onToggleMic={onToggleMic} />)
    await userEvent.click(screen.getByRole('button', { name: /mute microphone/i }))
    expect(onToggleMic).toHaveBeenCalledOnce()
  })

  it('shows Unmute when isMuted is true', () => {
    render(<CallControls {...defaultProps} isMuted={true} />)
    expect(screen.getByRole('button', { name: /unmute microphone/i })).toBeInTheDocument()
  })

  it('calls onToggleCamera when camera button is clicked', async () => {
    const onToggleCamera = vi.fn()
    render(<CallControls {...defaultProps} onToggleCamera={onToggleCamera} />)
    await userEvent.click(screen.getByRole('button', { name: /turn off camera/i }))
    expect(onToggleCamera).toHaveBeenCalledOnce()
  })

  it('calls onEndCall when end call is clicked', async () => {
    const onEndCall = vi.fn()
    render(<CallControls {...defaultProps} onEndCall={onEndCall} />)
    await userEvent.click(screen.getByRole('button', { name: /end call/i }))
    expect(onEndCall).toHaveBeenCalledOnce()
  })

  it('shows Stop Share when screen sharing is active', () => {
    render(<CallControls {...defaultProps} isScreenSharing={true} />)
    expect(screen.getByRole('button', { name: /stop screen sharing/i })).toBeInTheDocument()
  })

  it('shows stop recording button when recording', () => {
    render(<CallControls {...defaultProps} isRecording={true} />)
    expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument()
  })

  it('renders optional Chat button when onToggleChat is provided', () => {
    render(<CallControls {...defaultProps} onToggleChat={vi.fn()} />)
    expect(screen.getByRole('button', { name: /toggle chat/i })).toBeInTheDocument()
  })

  it('renders optional Participants button when onToggleParticipants is provided', () => {
    render(<CallControls {...defaultProps} onToggleParticipants={vi.fn()} />)
    expect(screen.getByRole('button', { name: /toggle participants/i })).toBeInTheDocument()
  })

  it('toolbar has correct ARIA role', () => {
    render(<CallControls {...defaultProps} />)
    expect(screen.getByRole('toolbar', { name: /call controls/i })).toBeInTheDocument()
  })
})
