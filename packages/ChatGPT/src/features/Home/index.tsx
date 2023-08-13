import { useAppSelector } from '@chatgpt/app/hooks';
import { selectSelectedConversation } from '@chatgpt/features/Conversations/conversationSlice';
import AddConversation from '@chatgpt/features/Home/AddConversation';
import ConversationDetail from './ConversationDetail';
import { useMemo } from 'react';

export default function Home() {
  const selectedConversation = useAppSelector(selectSelectedConversation);
  return useMemo(() => {
    if (selectedConversation) {
      return <ConversationDetail conversation={selectedConversation} />;
    } else {
      return <AddConversation />;
    }
  }, [selectedConversation]);
}
