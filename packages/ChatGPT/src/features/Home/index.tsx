import { useConversationStore, selectSelected } from '@chatgpt/features/Conversations/conversationSlice';
import { useMemo } from 'react';
import { match } from 'ts-pattern';
import AddConversation from '../Adds/AddConversation';
import { SelectedType } from '../Conversations/types';
import ConversationDetail from './ConversationDetail';
import FolderDetail from './FolderDetail';
import { useShallow } from 'zustand/react/shallow';

export default function Home() {
  const selected = useConversationStore(useShallow(selectSelected));
  return useMemo(() => {
    return match(selected)
      .with({ tag: SelectedType.Conversation }, (selected) => <ConversationDetail conversation={selected.value} />)
      .with({ tag: SelectedType.Folder }, (selected) => <FolderDetail folder={selected.value} />)
      .with({ tag: SelectedType.None }, () => <AddConversation />)
      .exhaustive();
  }, [selected]);
}
