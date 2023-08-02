import { Box, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Drawer } from '@mui/material';
import { Inbox, Mail } from '@mui/icons-material';
import { headersHeight } from '@chatgpt/components/Headers';
import {
  Conversation,
  selectConversations,
  selectSelectedConversation,
  setSelected,
} from '@chatgpt/features/Conversations/conversationSlice';
import { useAppDispatch, useAppSelector } from '@chatgpt/app/hooks';
import { useCallback, useMemo } from 'react';

export interface DrawerProps {
  open: boolean;
  drawerWidth: number;
}

export default function AppDrawer({ open, drawerWidth }: DrawerProps) {
  const conversations = useAppSelector(selectConversations);
  const selectedConversation = useAppSelector(selectSelectedConversation);
  const dispatch = useAppDispatch();
  const handleSelect = useCallback(
    (conversation: Conversation) => {
      dispatch(setSelected(conversation));
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
          <ListItemIcon>{conversation.mode === 'prompt' ? <Inbox /> : <Mail />}</ListItemIcon>
          <ListItemText primary={conversation.title} secondary={conversation.info} />
        </ListItemButton>
      );
    });
  }, [conversations, handleSelect, selectedConversation?.id]);
  return (
    <Drawer
      variant="persistent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        '& .MuiToolbar-root': {
          height: `${headersHeight}px`,
          minHeight: `${headersHeight}px`,
        },
      }}
      open={open}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>{content}</List>
      </Box>
    </Drawer>
  );
}
