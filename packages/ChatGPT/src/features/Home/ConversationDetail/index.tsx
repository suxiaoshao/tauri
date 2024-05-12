import { Box } from '@mui/material';
import Header from './components/ConversationHeader';
import { Conversation } from '@chatgpt/types/conversation';
import { useCallback } from 'react';
import { fetchMessage } from '@chatgpt/service/chat/query';
import ChatForm from '@chatgpt/components/ChatForm';
import usePromiseFn from '@chatgpt/hooks/usePromiseFn';
import MessageHistory from '@chatgpt/components/MessageHistory';

export interface ConversationDetailProps {
  conversation: Conversation;
}

export default function ConversationDetail({ conversation }: ConversationDetailProps) {
  const fetchFn = useCallback(
    async (content: string) => {
      await fetchMessage({
        content: content,
        id: conversation.id,
      });
    },
    [conversation.id],
  );
  const [status, onSendMessage] = usePromiseFn(fetchFn);
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'transparent',
      }}
    >
      <Header conversation={conversation} />
      <Box sx={{ flex: '1 1 0', overflowY: 'auto' }}>
        <MessageHistory messages={conversation.messages} />
      </Box>
      <ChatForm status={status} onSendMessage={onSendMessage} />
    </Box>
  );
}
