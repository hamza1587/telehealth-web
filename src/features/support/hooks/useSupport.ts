import { useState, useCallback } from 'react'
import { apiClient } from '@shared/api/Client.ts'
import type { SupportTicket, TicketForm, TicketMessage } from '@shared/types/support.ts'

export function useSupportTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTickets = useCallback(async (status?: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get(`/platform/support/my-tickets?status=${status || ''}`)
      const data = res as { items?: SupportTicket[] }
      setTickets(data.items || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tickets')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchTicketDetail = useCallback(async (ticketId: string) => {
    setLoading(true)
    try {
      const res = await apiClient.get(`/platform/support/tickets/${ticketId}`)
      const data = res as SupportTicket & { comments?: TicketMessage[] }
      setSelectedTicket(data)
      setMessages(data.comments || [])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ticket details')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const createTicket = useCallback(async (form: TicketForm) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.post('/platform/support/tickets', form)
      const data = res as { ticket: SupportTicket }
      setTickets(prev => [data.ticket, ...prev])
      return { success: true, ticket: data.ticket }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket')
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    } finally {
      setLoading(false)
    }
  }, [])

  const replyToTicket = useCallback(async (ticketId: string, content: string) => {
    try {
      const res = await apiClient.post(`/platform/support/tickets/${ticketId}/reply`, { content })
      const data = res as { message: TicketMessage }
      setMessages(prev => [...prev, data.message])
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }, [])

  const closeTicket = useCallback(async (ticketId: string, reason: string) => {
    try {
      await apiClient.post(`/platform/support/tickets/${ticketId}/close`, { reason })
      setTickets(prev =>
        prev.map(t => t.id === ticketId ? { ...t, status: 'resolved' as const } : t)
      )
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
    }
  }, [])

  return {
    tickets,
    selectedTicket,
    messages,
    loading,
    error,
    fetchTickets,
    fetchTicketDetail,
    createTicket,
    replyToTicket,
    closeTicket,
  }
}