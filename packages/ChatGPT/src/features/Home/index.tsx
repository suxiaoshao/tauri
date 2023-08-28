import { useAppSelector } from '@chatgpt/app/hooks';
import { SelectedType, selectSelected } from '@chatgpt/features/Conversations/conversationSlice';
import ConversationDetail from './ConversationDetail';
import { useMemo } from 'react';
import AddConversation from '../Adds/AddConversation';
import FolderDetail from './FolderDetail';

export default function Home() {
  const selected = useAppSelector(selectSelected);
  return useMemo(() => {
    switch (selected?.tag) {
      case SelectedType.Conversation:
        return <ConversationDetail conversation={selected.value} />;
      case SelectedType.Folder:
        return <FolderDetail folder={selected.value} />;
      case SelectedType.None:
        return <AddConversation />;
    }
  }, [selected]);
}
