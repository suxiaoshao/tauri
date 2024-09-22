import { Box } from '@mui/material';
import Header from './components/ConversationHeader';
import { Conversation } from '@chatgpt/types/conversation';
import { useCallback } from 'react';
import { fetchMessage } from '@chatgpt/service/chat/query';
import ChatForm from '@chatgpt/components/ChatForm';
import usePromiseFn from '@chatgpt/hooks/usePromiseFn';
import MessageHistory from '@chatgpt/components/MessageHistory';
import { deleteMessage } from '@chatgpt/service/chat/mutation';
import { WebviewWindow } from '@tauri-apps/api/window';

export interface ConversationDetailProps {
  conversation: Conversation;
}

const handleMessageDelete = async (id: number) => {
  await deleteMessage({ id });
};
const handleMessageView = (id: number) => {
  new WebviewWindow(`message-${id}`, {
    url: `/message/${id}`,
    title: `message-${id}`,
    transparent: true,
    decorations: false,
  });
};

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
        <MessageHistory
          onMessageViewed={handleMessageView}
          onMessageDeleted={handleMessageDelete}
          messages={conversation.messages}
        />
      </Box>
      <ChatForm status={status} onSendMessage={onSendMessage} />
    </Box>
  );
}
