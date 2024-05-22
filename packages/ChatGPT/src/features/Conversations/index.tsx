/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2023-09-06 17:14:35
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-19 08:05:24
 * @FilePath: /tauri/packages/ChatGPT/src/features/Conversations/index.tsx
 */
import { ChevronRight, ExpandMore } from '@mui/icons-material';
import {
  fetchConversations,
  selectChatData,
  selectSelectedNodeId,
  setSelected,
} from '@chatgpt/features/Conversations/conversationSlice';
import { useAppDispatch, useAppSelector } from '@chatgpt/app/hooks';
import { useCallback, useEffect } from 'react';
import { SimpleTreeView } from '@mui/x-tree-view';
import FolderItem from './components/FolderItem';
import ConversationItem from './components/ConversationItem';
import { getSelectedFromNodeId } from '@chatgpt/utils/chatData';
import { useNavigate } from 'react-router-dom';

export default function ConversationTree() {
  const navigate = useNavigate();
  const { conversations, folders } = useAppSelector(selectChatData);
  const selectedNodeId = useAppSelector(selectSelectedNodeId);
  const dispatch = useAppDispatch();
  const handleSelect = useCallback(
    (_event: React.SyntheticEvent, nodeIds: string | null) => {
      if (!nodeIds) {
        return;
      }
      dispatch(setSelected(getSelectedFromNodeId(nodeIds)));
      navigate('/');
    },
    [dispatch, navigate],
  );
  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);
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
