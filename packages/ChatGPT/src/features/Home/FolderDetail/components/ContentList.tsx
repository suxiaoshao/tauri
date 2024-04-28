/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-29 02:46:17
 * @FilePath: /tauri/packages/ChatGPT/src/features/Home/FolderDetail/components/ContentList.tsx
 */
import { useAppDispatch } from '@chatgpt/app/hooks';
import { SelectedType, setSelected } from '@chatgpt/features/Conversations/conversationSlice';
import { Conversation } from '@chatgpt/types/conversation';
import { Folder } from '@chatgpt/types/folder';
import { Avatar, Divider, List, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useCallback } from 'react';
import FolderIcon from '@mui/icons-material/Folder';

export interface ContentListProps {
  folders: Folder[];
  conversations: Conversation[];
}

export default function ContentList({ folders, conversations }: ContentListProps) {
  const dispatch = useAppDispatch();
  const handleFolderClick = useCallback(
    (folderId: number) => {
      dispatch(setSelected({ tag: SelectedType.Folder, value: folderId }));
    },
    [dispatch],
  );
  const handleConversationClick = useCallback(
    (conversationId: number) => {
      dispatch(setSelected({ tag: SelectedType.Conversation, value: conversationId }));
    },
    [dispatch],
  );
  return (
    <List>
      {folders.map((folder) => (
        <ListItemButton key={folder.id} onClick={() => handleFolderClick(folder.id)}>
          <ListItemIcon>
            <FolderIcon color="info" />
          </ListItemIcon>
          <ListItemText primary={folder.name} secondary={folder.path} />
        </ListItemButton>
      ))}
      {conversations.length + folders.length > 0 && <Divider />}
      {conversations.map((conversation) => (
        <ListItemButton key={conversation.id} onClick={() => handleConversationClick(conversation.id)}>
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: 'transparent' }}>{conversation.icon}</Avatar>
          </ListItemAvatar>
          <ListItemText primary={conversation.title} secondary={conversation.info} />
        </ListItemButton>
      ))}
    </List>
  );
}
