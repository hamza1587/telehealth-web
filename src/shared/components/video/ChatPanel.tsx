import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Paperclip } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isOwn: boolean;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  currentUserId: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  currentUserId
}) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full border rounded-lg bg-white">
      {/* Header */}
      <div className="p-3 border-b">
        <h3 className="font-semibold">Chat</h3>
        <Badge variant="secondary" className="mt-1">
          {messages.length} messages
        </Badge>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.isOwn
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {!message.isOwn && (
                  <p className="text-xs font-medium mb-1 opacity-70">
                    {message.sender}
                  </p>
                )}
                <p className="text-sm">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.isOwn ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <Button variant="outline" size="icon" aria-label="Attach file">
            <Paperclip className="w-4 h-4" />
          </Button>
          <Input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
            aria-label="Chat message input"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!newMessage.trim()}
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};