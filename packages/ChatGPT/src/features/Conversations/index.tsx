/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2023-09-06 17:14:35
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-19 08:05:24
 * @FilePath: /tauri/packages/ChatGPT/src/features/Conversations/index.tsx
 */
import { selectChatData, useConversationStore } from '@chatgpt/features/Conversations/conversationSlice';
import { getNodeId, getSelectedFromNodeId } from '@chatgpt/utils/chatData';
import { ChevronRight, ExpandMore } from '@mui/icons-material';
import { SimpleTreeView } from '@mui/x-tree-view';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import ConversationItem from './components/ConversationItem';
import FolderItem from './components/FolderItem';
import { useSelected } from './useSelected';

export default function ConversationTree() {
  const navigate = useNavigate();
  const { conversations, folders, fetchConversations } = useConversationStore(
    useShallow((state) => ({
      ...selectChatData(state),
      fetchConversations: state.fetchConversations,
    })),
  );
  const [selected, setSelected] = useSelected();
  const handleSelect = useCallback(
    (_event: React.SyntheticEvent | null, nodeIds: string | null) => {
      if (!nodeIds) {
        return;
      }
      navigate('/');
      setSelected(getSelectedFromNodeId(nodeIds));
    },
    [setSelected, navigate],
  );
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);
  return (
    <SimpleTreeView
      aria-label="file system navigator"
      sx={{ flex: '1 auto 0', width: '100%', overflowY: 'auto' }}
      selectedItems={getNodeId(selected)}
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
