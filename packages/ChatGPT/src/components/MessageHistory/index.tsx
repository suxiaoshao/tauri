import { Box } from '@mui/material';
import MessageItem, { BaseMessage } from '../MessageItem';
import { createContext, useMemo } from 'react';

export interface MessageHistoryProps {
  messages: BaseMessage[];
  onMessageViewed?: (id: number) => void;
  onMessageDeleted?: (id: number) => void;
}

export const MessageActionContext = createContext<{
  onMessageDeleted?: (id: number) => void;
  onMessageViewed?: (id: number) => void;
}>({});

export default function MessageHistory({ messages, onMessageDeleted, onMessageViewed }: MessageHistoryProps) {
  const contextValue = useMemo(() => ({ onMessageDeleted, onMessageViewed }), [onMessageDeleted, onMessageViewed]);
  return (
    <MessageActionContext.Provider value={contextValue}>
      <Box sx={{ mb: 4, width: '100%' }}>
        {messages.map((message) => (
          <MessageItem message={message} key={message.id} />
        ))}
      </Box>
    </MessageActionContext.Provider>
  );
}
