import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VideoTile } from '../VideoTile'

// livekit-client track mock
function makeTrack(attach = vi.fn(), detach = vi.fn()) {
  return { attach, detach } as unknown as import('livekit-client').LocalTrack
}

describe('VideoTile', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders participant name', () => {
    render(<VideoTile name="Dr. Smith" />)
    expect(screen.getByText(/Dr\. Smith/)).toBeInTheDocument()
  })

  it('shows (You) suffix for local participant', () => {
    render(<VideoTile name="Me" isLocal />)
    expect(screen.getByText(/Me \(You\)/)).toBeInTheDocument()
  })

  it('shows Muted badge when isMuted', () => {
    render(<VideoTile name="Patient" isMuted />)
    expect(screen.getByText('Muted')).toBeInTheDocument()
  })

  it('shows Screen Share badge when isScreenShare', () => {
    render(<VideoTile name="Presenter" isScreenShare />)
    expect(screen.getByText('Screen Share')).toBeInTheDocument()
  })

  it('calls track.attach with the video element on mount', () => {
    const attach = vi.fn()
    const detach = vi.fn()
    const track = makeTrack(attach, detach)
    render(<VideoTile name="User" track={track} />)
    expect(attach).toHaveBeenCalledWith(expect.any(HTMLVideoElement))
  })

  it('calls track.detach on unmount', () => {
    const detach = vi.fn()
    const track = makeTrack(vi.fn(), detach)
    const { unmount } = render(<VideoTile name="User" track={track} />)
    unmount()
    expect(detach).toHaveBeenCalledWith(expect.any(HTMLVideoElement))
  })

  it('does not attach when isCameraOff', () => {
    const attach = vi.fn()
    const track = makeTrack(attach, vi.fn())
    render(<VideoTile name="User" track={track} isCameraOff />)
    expect(attach).not.toHaveBeenCalled()
  })

  it('shows avatar when no track provided', () => {
    render(<VideoTile name="John Doe" />)
    // avatar shows initials
    expect(screen.getByText('JO')).toBeInTheDocument()
  })

  it('has correct group role and aria-label', () => {
    render(<VideoTile name="Patient" />)
    expect(screen.getByRole('group', { name: /Video tile for Patient/i })).toBeInTheDocument()
  })
})
