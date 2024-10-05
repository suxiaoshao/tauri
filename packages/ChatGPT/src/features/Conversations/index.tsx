/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2023-09-06 17:14:35
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-19 08:05:24
 * @FilePath: /tauri/packages/ChatGPT/src/features/Conversations/index.tsx
 */
import {
  selectChatData,
  selectSelectedNodeId,
  useConversationStore,
} from '@chatgpt/features/Conversations/conversationSlice';
import { getSelectedFromNodeId } from '@chatgpt/utils/chatData';
import { ChevronRight, ExpandMore } from '@mui/icons-material';
import { SimpleTreeView } from '@mui/x-tree-view';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import ConversationItem from './components/ConversationItem';
import FolderItem from './components/FolderItem';

export default function ConversationTree() {
  const navigate = useNavigate();
  const { conversations, folders, selectedNodeId, setSelected, fetchConversations } = useConversationStore(
    useShallow((state) => ({
      ...selectChatData(state),
      selectedNodeId: selectSelectedNodeId(state),
      setSelected: state.setSelected,
      fetchConversations: state.fetchConversations,
    })),
  );
  const handleSelect = useCallback(
    (_event: React.SyntheticEvent, nodeIds: string | null) => {
      if (!nodeIds) {
        return;
      }
      setSelected(getSelectedFromNodeId(nodeIds));
      navigate('/');
    },
    [setSelected, navigate],
  );
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);
  return (
    <SimpleTreeView
      aria-label="file system navigator"
      sx={{ flexGrow: 1, width: '100%', overflowY: 'auto' }}
      selectedItems={selectedNodeId}
      onSelectedItemsChange={handleSelect}
      multiSelect={false}
      slots={{ collapseIcon: ExpandMore, expandIcon: ChevronRight }}
    >
      {folders.map((f) => (
        <FolderItem key={f.id} folder={f} />
      ))}
      {conversations.map((c) => (
        <ConversationItem key={c.id} conversation={c} />
      ))}
    </SimpleTreeView>
  );
}
