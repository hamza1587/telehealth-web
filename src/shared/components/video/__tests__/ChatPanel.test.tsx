import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatPanel } from '../ChatPanel'

const baseMessages = [
  { id: '1', sender: 'Dr. Smith', content: 'Hello, how are you?', timestamp: new Date('2026-01-01T10:00:00'), isOwn: false },
  { id: '2', sender: 'Me',        content: 'I am fine, thank you.', timestamp: new Date('2026-01-01T10:01:00'), isOwn: true },
]

describe('ChatPanel', () => {
  it('renders all messages', () => {
    render(<ChatPanel messages={baseMessages} onSendMessage={vi.fn()} currentUserId="user-1" />)
    expect(screen.getByText('Hello, how are you?')).toBeInTheDocument()
    expect(screen.getByText('I am fine, thank you.')).toBeInTheDocument()
  })

  it('shows sender name for received messages', () => {
    render(<ChatPanel messages={baseMessages} onSendMessage={vi.fn()} currentUserId="user-1" />)
    expect(screen.getByText('Dr. Smith')).toBeInTheDocument()
  })

  it('calls onSendMessage with input value when Send is clicked', async () => {
    const onSend = vi.fn()
    render(<ChatPanel messages={[]} onSendMessage={onSend} currentUserId="user-1" />)
    const input = screen.getByRole('textbox', { name: /chat message input/i })
    await userEvent.type(input, 'Nice to meet you')
    await userEvent.click(screen.getByRole('button', { name: /send message/i }))
    expect(onSend).toHaveBeenCalledWith('Nice to meet you')
  })

  it('clears input after sending', async () => {
    render(<ChatPanel messages={[]} onSendMessage={vi.fn()} currentUserId="user-1" />)
    const input = screen.getByRole('textbox', { name: /chat message input/i })
    await userEvent.type(input, 'Test')
    await userEvent.click(screen.getByRole('button', { name: /send message/i }))
    expect(input).toHaveValue('')
  })

  it('sends message on Enter key', async () => {
    const onSend = vi.fn()
    render(<ChatPanel messages={[]} onSendMessage={onSend} currentUserId="user-1" />)
    const input = screen.getByRole('textbox', { name: /chat message input/i })
    await userEvent.type(input, 'Enter test{Enter}')
    expect(onSend).toHaveBeenCalledWith('Enter test')
  })

  it('does not send empty message', async () => {
    const onSend = vi.fn()
    render(<ChatPanel messages={[]} onSendMessage={onSend} currentUserId="user-1" />)
    const sendBtn = screen.getByRole('button', { name: /send message/i })
    expect(sendBtn).toBeDisabled()
    await userEvent.click(sendBtn)
    expect(onSend).not.toHaveBeenCalled()
  })

  it('shows message count', () => {
    render(<ChatPanel messages={baseMessages} onSendMessage={vi.fn()} currentUserId="user-1" />)
    expect(screen.getByText(/2 messages/i)).toBeInTheDocument()
  })
})
