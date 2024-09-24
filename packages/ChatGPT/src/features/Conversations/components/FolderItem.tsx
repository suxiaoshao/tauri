/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2023-09-06 17:14:35
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-19 08:02:13
 * @FilePath: /tauri/packages/ChatGPT/src/features/Conversations/components/FolderItem.tsx
 */
import { type Folder } from '@chatgpt/types/folder';
import { getNodeIdByFolder } from '@chatgpt/utils/chatData';
import { Folder as FolderIcon } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { TreeItem } from '@mui/x-tree-view';
import ConversationItem from './ConversationItem';

export interface FolderItemProps {
  folder: Folder;
}

export default function FolderItem({ folder }: FolderItemProps) {
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
