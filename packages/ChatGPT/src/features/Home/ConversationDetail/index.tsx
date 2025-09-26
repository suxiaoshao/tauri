import ChatForm from '@chatgpt/components/ChatForm';
import MessageHistory from '@chatgpt/components/MessageHistory';
import usePromiseFn from '@chatgpt/hooks/usePromiseFn';
import { deleteMessage } from '@chatgpt/service/chat/mutation';
import { fetchMessage } from '@chatgpt/service/chat/query';
import { type Conversation } from '@chatgpt/types/conversation';
import { Box } from '@mui/material';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { useCallback } from 'react';
import Header from './components/ConversationHeader';
import { useTranslation } from 'react-i18next';

export interface ConversationDetailProps {
  conversation: Conversation;
}

const handleMessageDelete = async (id: number) => {
  await deleteMessage({ id });
};

export default function ConversationDetail({ conversation }: ConversationDetailProps) {
  const { t } = useTranslation();
  const handleMessageView = (id: number) => {
    // eslint-disable-next-line no-new
    new WebviewWindow(`message-${id}`, {
      url: `/message/${id}`,
      title: t('message_preview_title', { id }),
      transparent: true,
      decorations: false,
    });
  };
  const fetchFn = useCallback(
    async (content: string, extensionName: string | null) => {
      await fetchMessage({
        content: content,
        id: conversation.id,
        extensionName,
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
