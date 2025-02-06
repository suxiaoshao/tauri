import { useConversationStore } from '@chatgpt/features/Conversations/conversationSlice';
import { type Conversation } from '@chatgpt/types/conversation';
import { type Folder } from '@chatgpt/types/folder';
import { findConversation, findFolder } from '@chatgpt/utils/chatData';
import { useMemo } from 'react';
import { match } from 'ts-pattern';
import { type Enum } from 'types';
import { useShallow } from 'zustand/react/shallow';
import AddConversation from '../Adds/AddConversation';
import { SelectedType } from '../Conversations/types';
import { useSelected } from '../Conversations/useSelected';
import ConversationDetail from './ConversationDetail';
import FolderDetail from './FolderDetail';

export default function Home() {
  const conversations = useConversationStore(useShallow((state) => state.value));
  const selected = useSelected()[0];
  const selectedData = useMemo<
    Enum<SelectedType.Conversation, Conversation> | Enum<SelectedType.Folder, Folder> | Enum<SelectedType.None>
  >(
    () =>
      match(selected)
        .with({ tag: SelectedType.Folder }, (selected) => {
          return match(findFolder(conversations, selected.value))
            .with(null, () => ({ tag: SelectedType.None }) as const)
            .otherwise((folder) => ({ tag: SelectedType.Folder, value: folder }) as const);
        })
        .with({ tag: SelectedType.Conversation }, (selected) => {
          return match(findConversation(conversations, selected.value))
            .with(null, () => ({ tag: SelectedType.None }) as const)
            .otherwise((conversation) => ({ tag: SelectedType.Conversation, value: conversation }) as const);
        })
        .otherwise(() => ({ tag: SelectedType.None })),
    [conversations, selected],
  );
  return useMemo(() => {
    return match(selectedData)
      .with({ tag: SelectedType.Conversation }, (selected) => <ConversationDetail conversation={selected.value} />)
      .with({ tag: SelectedType.Folder }, (selected) => <FolderDetail folder={selected.value} />)
      .with({ tag: SelectedType.None }, () => <AddConversation />)
      .exhaustive();
  }, [selectedData]);
}
