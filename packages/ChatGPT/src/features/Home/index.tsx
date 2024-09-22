import { useAppSelector } from '@chatgpt/app/hooks';
import { selectSelected } from '@chatgpt/features/Conversations/conversationSlice';
import { useMemo } from 'react';
import { match } from 'ts-pattern';
import AddConversation from '../Adds/AddConversation';
import { SelectedType } from '../Conversations/types';
import ConversationDetail from './ConversationDetail';
import FolderDetail from './FolderDetail';

export default function Home() {
  const selected = useAppSelector(selectSelected);
  return useMemo(() => {
    return match(selected)
      .with({ tag: SelectedType.Conversation }, (selected) => <ConversationDetail conversation={selected.value} />)
      .with({ tag: SelectedType.Folder }, (selected) => <FolderDetail folder={selected.value} />)
      .with({ tag: SelectedType.None }, () => <AddConversation />)
      .exhaustive();
  }, [selected]);
}
