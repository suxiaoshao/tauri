/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2023-09-06 17:14:35
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-19 08:05:24
 * @FilePath: /tauri/packages/ChatGPT/src/features/Conversations/index.tsx
 */
import { selectChatData, useConversationStore } from '@chatgpt/features/Conversations/conversationSlice';
import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import ConversationItem from './components/ConversationItem';
import FolderItem from './components/FolderItem';
import { SidebarGroupContent, SidebarMenu } from '@chatgpt/components/ui/sidebar';

export default function ConversationTree() {
  const { conversations, folders, fetchConversations } = useConversationStore(
    useShallow((state) => ({
      ...selectChatData(state),
      fetchConversations: state.fetchConversations,
    })),
  );
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);
  return (
    <SidebarGroupContent className="overflow-y-auto" aria-label="file system navigator">
      <SidebarMenu>
        {folders.map((f) => (
          <FolderItem subItem={false} key={f.id} folder={f} />
        ))}
        {conversations.map((c) => (
          <ConversationItem subItem={false} key={c.id} conversation={c} />
        ))}
      </SidebarMenu>
    </SidebarGroupContent>
  );
}
