import { Folder } from '@chatgpt/types/folder';
import { Box } from '@mui/material';
import FolderHeader from './components/Header';

export interface FolderDetailProps {
  folder: Folder;
}

export default function FolderDetail({ folder }: FolderDetailProps) {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'transparent',
      }}
    >
      <FolderHeader folder={folder} />
    </Box>
  );
}
