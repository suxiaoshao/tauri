/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2023-09-06 17:14:35
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-19 08:02:13
 * @FilePath: /tauri/packages/ChatGPT/src/features/Conversations/components/FolderItem.tsx
 */
import { Folder } from '@chatgpt/types/folder';
import { TreeItem } from '@mui/x-tree-view';
import ConversationItem from './ConversationItem';
import { getNodeIdByFolder } from '@chatgpt/utils/chatData';
import { Box, Typography } from '@mui/material';
import { Folder as FolderIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export interface FolderItemProps {
  folder: Folder;
}

export default function FolderItem({ folder }: FolderItemProps) {
  const navigate = useNavigate();
  return (
    <TreeItem
      itemId={getNodeIdByFolder(folder)}
      label={
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 0.5,
            pr: 0,
          }}
        >
          <FolderIcon color="info" sx={{ mr: 1 }} />
          <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1 }}>
            {folder.name}
          </Typography>
          <Typography variant="caption" color="inherit">
            {folder.folders.length + folder.conversations.length}
          </Typography>
        </Box>
      }
      onDoubleClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate('/');
      }}
    >
      {folder.folders.map((f) => (
        <FolderItem key={f.id} folder={f} />
      ))}
      {folder.conversations.map((c) => (
        <ConversationItem key={c.id} conversation={c} />
      ))}
    </TreeItem>
  );
}
