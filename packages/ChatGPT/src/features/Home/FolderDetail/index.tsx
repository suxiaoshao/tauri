import { Folder } from '@chatgpt/types/folder';
import { Box, List } from '@mui/material';
import { match, P } from 'ts-pattern';
import ContentEmpty from './components/ContentEmpty';
import ContentList from './components/ContentList';
import FolderHeader from './components/FolderHeader';

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
        {match(folder.conversations.length + folder.folders.length)
          .with(P.number.gt(0), () => <ContentList folders={folder.folders} conversations={folder.conversations} />)
          .otherwise(() => (
            <ContentEmpty />
          ))}
      </List>
    </Box>
  );
}
