import { Folder } from '@chatgpt/types/folder';
import { TreeItem } from '@mui/lab';
import ConversationItem from './ConversationItem';
import { getNodeIdByFolder } from '@chatgpt/utils/chatData';
import { Box, Typography } from '@mui/material';
import { Folder as FolderIcon } from '@mui/icons-material';

export interface FolderItemProps {
  folder: Folder;
}

export default function FolderItem({ folder }: FolderItemProps) {
  return (
    <TreeItem
      nodeId={getNodeIdByFolder(folder)}
      label={
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 0.5,
            pr: 0,
          }}
        >
          <FolderIcon color="inherit" sx={{ mr: 1 }} />
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
