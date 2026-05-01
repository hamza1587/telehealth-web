import { useState, useEffect } from 'react'
import { apiBaseUrl } from '@shared/config/patient.ts'
import type { SupportTicket, TicketForm, TicketMessage } from '@shared/types/support.ts'

export function useSupport(userId: string | null) {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [messages, setMessages] = useState<Record<string, TicketMessage[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Fetch tickets
  useEffect(() => {
    if (!userId) return

    const fetchTickets = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`${apiBaseUrl}/support/my-tickets`)
        if (!response.ok) {
          throw new Error('Failed to fetch tickets')
        }
        const data = await response.json()
        setTickets(data.tickets || [])
      } catch (err) {
        console.error('[API Error] Failed to fetch support tickets:', {
          error: err instanceof Error ? err.message : String(err),
          timestamp: new Date().toISOString(),
          endpoint: `/platform/users/${userId}/tickets`
        })
        setError(err instanceof Error ? err.message : 'Failed to load tickets')
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [userId])

  // Fetch messages for a ticket
  const fetchMessages = async (ticketId: string) => {
    try {
      const response = await fetch(`${apiBaseUrl}/support/tickets/${ticketId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }
      const data = await response.json()
      setMessages(prev => ({ ...prev, [ticketId]: data.messages || [] }))
    } catch (err) {
      console.error('[API Error] Failed to fetch ticket messages:', {
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
        endpoint: `/platform/tickets/${ticketId}/messages`
      })
    }
  }

  // Create ticket
  const createTicket = async (form: TicketForm) => {
    if (!userId) return null

    setSubmitting(true)
    setError(null)
    try {
      const response = await fetch(`${apiBaseUrl}/support/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...form,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create ticket')
      }

      const data = await response.json()
      setTickets(prev => [data.ticket, ...prev])
      return data.ticket
    } catch (err) {
      console.error('[API Error] Failed to create support ticket:', {
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
        endpoint: '/platform/tickets'
      })
      setError(err instanceof Error ? err.message : 'Failed to create ticket')
      return null
    } finally {
      setSubmitting(false)
    }
  }

  // Add message to ticket
  const addMessage = async (ticketId: string, message: string) => {
    try {
      const response = await fetch(`${apiBaseUrl}/platform/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      setMessages(prev => ({
        ...prev,
        [ticketId]: [...(prev[ticketId] || []), data.message],
      }))
      return data.message
    } catch (err) {
      console.error('[API Error] Failed to add ticket message:', {
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
        endpoint: `/platform/tickets/${ticketId}/messages`
      })
      return null
    }
  }

  return {
    tickets,
    messages,
    loading,
    error,
    submitting,
    fetchMessages,
    createTicket,
    addMessage,
  }
}