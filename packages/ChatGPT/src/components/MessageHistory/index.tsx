import { Box } from '@mui/material';
import { useMemo } from 'react';
import MessageItem from '../MessageItem';
import { BaseMessage } from '../MessageItem/types';
import { MessageActionContext } from './MessageActionContext';

export interface MessageHistoryProps {
  messages: BaseMessage[];
  onMessageViewed?: (id: number) => void;
  onMessageDeleted?: (id: number) => void;
}

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
