import { type Folder } from '@chatgpt/types/folder';
import { match, P } from 'ts-pattern';
import ContentEmpty from './components/ContentEmpty';
import ContentList from './components/ContentList';
import FolderHeader from './components/FolderHeader';

export interface FolderDetailProps {
  folder: Folder;
}

export default function FolderDetail({ folder }: FolderDetailProps) {
  return (
    <div className="size-full flex flex-col">
      <FolderHeader folder={folder} />
      {match(folder.conversations.length + folder.folders.length)
        .with(P.number.gt(0), () => <ContentList folders={folder.folders} conversations={folder.conversations} />)
        .otherwise(() => (
          <ContentEmpty />
        ))}
    </div>
  );
}
