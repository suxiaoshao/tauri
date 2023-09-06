import { Folder } from '@chatgpt/types/folder';
import { List, Box } from '@mui/material';
import FolderHeader from './components/FolderHeader';
import ContentList from './components/ContentList';
import ContentEmpty from './components/ContentEmpty';

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
      <List>
        {folder.conversations.length + folder.folders.length > 0 ? (
          <ContentList folders={folder.folders} conversations={folder.conversations} />
        ) : (
          <ContentEmpty />
        )}
      </List>
    </Box>
  );
}
