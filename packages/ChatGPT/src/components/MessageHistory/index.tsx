import { Box } from '@mui/material';
import { useMemo, useState } from 'react';
import MessageItem from '../MessageItem';
import { type BaseMessage } from '../MessageItem/types';
import { MessageActionContext } from './MessageActionContext';
import { useHotkeys } from 'react-hotkeys-hook';

export interface MessageHistoryProps {
  messages: BaseMessage[];
  onMessageViewed?: (id: number) => void;
  onMessageDeleted?: (id: number) => Promise<void>;
}

export default function MessageHistory({ messages, onMessageDeleted, onMessageViewed }: MessageHistoryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const contextValue = useMemo(() => ({ onMessageDeleted, onMessageViewed }), [onMessageDeleted, onMessageViewed]);
  useHotkeys(
    'up',
    (event) => {
      event.preventDefault();
      setSelectedIndex((prev) => {
        if (prev === null || prev <= 0) {
          return messages.length - 1;
        }
        return prev - 1;
      });
    },
    {},
    [messages.length],
  );
  useHotkeys(
    'down',
    (event) => {
      event.preventDefault();
      setSelectedIndex((prev) => {
        if (prev === null || prev >= messages.length - 1) {
          return 0;
        }
        return prev + 1;
      });
    },
    [messages.length],
  );
  useHotkeys(
    ['delete', 'backspace'],
    async () => {
      if (selectedIndex !== null) {
        const message = messages.at(selectedIndex);
        if (message) {
          await onMessageDeleted?.(message.id);
          setSelectedIndex(null);
        }
      }
    },
    {},
    [selectedIndex, onMessageDeleted, messages],
  );
  useHotkeys(
    'space',
    () => {
      if (selectedIndex !== null) {
        const message = messages.at(selectedIndex);
        if (message) {
          onMessageViewed?.(message.id);
        }
      }
    },
    {},
    [onMessageViewed, selectedIndex, messages],
  );
  useHotkeys(
    'enter',
    () => {
      setSelectedIndex(null);
    },
    {},
    [onMessageViewed],
  );
  return (
    <MessageActionContext.Provider value={contextValue}>
      <Box sx={{ mb: 4, width: '100%' }}>
        {messages.map((message, index) => (
          <MessageItem selected={selectedIndex === index} message={message} key={message.id} />
        ))}
      </Box>
    </MessageActionContext.Provider>
  );
}
