import React, { useState, useRef, useEffect } from 'react'

interface ChatMessage {
  id: string
  sender: string
  content: string
  timestamp: Date
  isOwn: boolean
}

interface ChatPanelProps {
  messages: ChatMessage[]
  onSendMessage: (content: string) => void
  currentUserId: string
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  // currentUserId is part of the public API for future sender-filtering features
  currentUserId: _currentUserId, // eslint-disable-line @typescript-eslint/no-unused-vars
}) => {
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim())
      setNewMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full border rounded-lg bg-white">
      <div className="p-3 border-b">
        <h3 className="font-semibold">Chat</h3>
        <span className="text-xs text-gray-500" aria-live="polite">{messages.length} messages</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${message.isOwn ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
                  }`}
              >
                {!message.isOwn && (
                  <p className="text-xs font-medium mb-1 opacity-70">{message.sender}</p>
                )}
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${message.isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-3 border-t">
        <div className="flex gap-2">
          <button
            type="button"
            className="px-3 py-2 border rounded hover:bg-gray-50"
            aria-label="Attach file"
          >
            Attach
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border rounded"
            aria-label="Chat message input"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
            aria-label="Send message"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}