import { apiClient } from '@/api/apiClient';

export interface ChatMessage {
  id: string;
  callId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

export interface SendChatMessageRequest {
  callId: string;
  content: string;
}

export async function sendChatMessage(request: SendChatMessageRequest): Promise<ChatMessage> {
  const response = await apiClient.post(`/calls/${request.callId}/chat`, {
    content: request.content
  });
  return response.data;
}

export async function getChatHistory(callId: string): Promise<ChatMessage[]> {
  const response = await apiClient.get(`/calls/${callId}/chat`);
  return response.data;
}