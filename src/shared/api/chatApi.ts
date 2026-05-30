import { apiClient } from '@shared/api/apiClient'

export interface ChatMessage {
  id: string
  callId: string
  senderId: string
  senderName: string
  content: string
  timestamp: string
}

export interface SendChatMessageRequest {
  callId: string
  content: string
}

export async function sendChatMessage(request: SendChatMessageRequest): Promise<ChatMessage> {
  return apiClient.post<ChatMessage>(`/calls/${request.callId}/chat`, {
    content: request.content,
  })
}

export async function getChatHistory(callId: string): Promise<ChatMessage[]> {
  return apiClient.get<ChatMessage[]>(`/calls/${callId}/chat`)
}