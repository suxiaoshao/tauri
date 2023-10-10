import { Message } from '@chatgpt/types/message';
import { Box } from '@mui/material';
import MessageItem from '../MessageItem';

export interface MessageHistoryProps {
  messages: Message[];
}

export default function MessageHistory({ messages }: MessageHistoryProps) {
  return (
    <Box sx={{ mb: 4, width: '100%' }}>
      {messages.map((message) => (
        <MessageItem message={message} key={message.id} />
      ))}
    </Box>
  );
}
