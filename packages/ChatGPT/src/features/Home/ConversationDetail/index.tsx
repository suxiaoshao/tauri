import { Box } from '@mui/material';
import ChatForm from './components/ChatForm';
import Header from './components/Header';
import MessageHistory from './components/MessageHistory.tsx';
import { Conversation } from '@chatgpt/types/conversation';
import { Reducer, useReducer } from 'react';

export interface ConversationDetailProps {
  conversation: Conversation;
}

export enum FetchingMessageAction {
  complete = 'complete',
  start = 'start',
}

export enum FetchingMessageType {
  loading = 'loading',
  init = 'init',
}

type FetchingMessageReducer = Reducer<FetchingMessageType, FetchingMessageAction>;

const reducer: FetchingMessageReducer = (state: FetchingMessageType, action) => {
  switch (action) {
    case FetchingMessageAction.complete:
      return FetchingMessageType.init;
    case FetchingMessageAction.start:
      return FetchingMessageType.loading;
  }
};

export default function ConversationDetail({ conversation }: ConversationDetailProps) {
  const [fetchingMessage, fetchingMessageDispatch] = useReducer<FetchingMessageReducer>(
    reducer,
    FetchingMessageType.init,
  );
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
      <ChatForm
        conversationId={conversation.id}
        fetchingMessageDispatch={fetchingMessageDispatch}
        fetchingMessage={fetchingMessage}
      />
    </Box>
  );
}
