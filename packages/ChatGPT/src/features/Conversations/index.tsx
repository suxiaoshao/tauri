import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Drawer,
  Divider,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import { Add, Settings } from '@mui/icons-material';
import {
  selectConversations,
  selectSelectedConversation,
  setSelected,
} from '@chatgpt/features/Conversations/conversationSlice';
import { useAppDispatch, useAppSelector } from '@chatgpt/app/hooks';
import { useCallback, useMemo } from 'react';
import { Conversation } from '@chatgpt/types/conversation';
import { invoke } from '@tauri-apps/api';

const headersHeight = 28;

export interface DrawerProps {
  open: boolean;
  drawerWidth: number;
}

export default function AppDrawer({ open, drawerWidth }: DrawerProps) {
  const conversations = useAppSelector(selectConversations);
  const selectedConversation = useAppSelector(selectSelectedConversation);
  const dispatch = useAppDispatch();
  const handleSelect = useCallback(
    (conversation?: Conversation) => {
      dispatch(setSelected(conversation?.id ?? null));
    },
    [dispatch],
  );
  const content = useMemo(() => {
    return conversations.map((conversation) => {
      return (
        <ListItemButton
          key={conversation.id}
          onClick={() => handleSelect(conversation)}
          selected={conversation.id === selectedConversation?.id}
          dense
        >
          <ListItemAvatar>
            <Avatar sx={{ backgroundColor: 'transparent' }}>{conversation.icon}</Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={conversation.title}
            secondary={conversation.info}
            secondaryTypographyProps={{ noWrap: true }}
          />
        </ListItemButton>
      );
    });
  }, [conversations, handleSelect, selectedConversation?.id]);
  const handleSetting = useCallback(async () => {
    await invoke('plugin:config|create_setting_window');
  }, []);
  return (
    <Drawer
      variant="persistent"
      data-tauri-drag-region
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: 'transparent',
        },
        '& .MuiToolbar-root': {
          height: `${headersHeight}px`,
          minHeight: `${headersHeight}px`,
          backgroundColor: 'transparent',
        },
        backgroundColor: 'transparent',
      }}
      open={open}
    >
      <Toolbar data-tauri-drag-region />
      <Box sx={{ overflow: 'auto' }}>
        <List>{content}</List>
        <Divider />
        <List>
          <ListItemButton selected={selectedConversation === undefined} onClick={() => handleSelect()}>
            <ListItemIcon>
              <Add />
            </ListItemIcon>
            <ListItemText primary="Add" />
          </ListItemButton>
          <ListItemButton onClick={handleSetting}>
            <ListItemIcon>
              <Settings />
            </ListItemIcon>
            <ListItemText primary="Setting" />
          </ListItemButton>
        </List>
      </Box>
    </Drawer>
  );
}
