import { ChevronRight, ExpandMore } from '@mui/icons-material';
import { selectChatData, selectSelectedNodeId, setSelected } from '@chatgpt/features/Conversations/conversationSlice';
import { useAppDispatch, useAppSelector } from '@chatgpt/app/hooks';
import { useCallback } from 'react';
import { TreeView } from '@mui/lab';
import FolderItem from './components/FolderItem';
import ConversationItem from './components/ConversationItem';
import { getSelectedFromNodeId } from '@chatgpt/utils/chatData';

export default function ConversationTree() {
  const { conversations, folders } = useAppSelector(selectChatData);
  const selectedNodeId = useAppSelector(selectSelectedNodeId);
  const dispatch = useAppDispatch();
  const handleSelect = useCallback(
    (event: React.SyntheticEvent, nodeIds: string) => {
      dispatch(setSelected(getSelectedFromNodeId(nodeIds)));
    },
    [dispatch],
  );
  return (
    <TreeView
      aria-label="file system navigator"
      defaultCollapseIcon={<ExpandMore />}
      defaultExpandIcon={<ChevronRight />}
      sx={{ flexGrow: 1, width: '100%', overflowY: 'auto' }}
      selected={selectedNodeId}
      onNodeSelect={handleSelect}
    >
      {folders.map((f) => (
        <FolderItem key={f.id} folder={f} />
      ))}
      {conversations.map((c) => (
        <ConversationItem key={c.id} conversation={c} />
      ))}
    </TreeView>
  );
}
