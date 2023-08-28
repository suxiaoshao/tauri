import { Folder } from '@chatgpt/types/folder';
import { TreeItem } from '@mui/lab';
import ConversationItem from './ConversationItem';
import { getNodeIdByFolder } from '@chatgpt/utils/chatData';

export interface FolderItemProps {
  folder: Folder;
}

export default function FolderItem({ folder }: FolderItemProps) {
  return (
    <TreeItem nodeId={getNodeIdByFolder(folder)} label={folder.name}>
      {folder.folders.map((f) => (
        <FolderItem key={f.id} folder={f} />
      ))}
      {folder.conversations.map((c) => (
        <ConversationItem key={c.id} conversation={c} />
      ))}
    </TreeItem>
  );
}
