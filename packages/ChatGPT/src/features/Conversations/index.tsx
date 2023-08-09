import { Box, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Drawer, Divider } from '@mui/material';
import { Add, Inbox, Mail } from '@mui/icons-material';
import { headersHeight } from '@chatgpt/components/Headers';
import {
  selectConversations,
  selectSelectedConversation,
  setSelected,
} from '@chatgpt/features/Conversations/conversationSlice';
import { useAppDispatch, useAppSelector } from '@chatgpt/app/hooks';
import { useCallback, useMemo } from 'react';
import { Mode } from '../Home/components/AddConversation';
import { Conversation } from '@chatgpt/types/conversation';

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
          <ListItemIcon>{conversation.mode === Mode.Single ? <Inbox /> : <Mail />}</ListItemIcon>
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
        <Divider />
        <List>
          <ListItemButton selected={selectedConversation === undefined} onClick={() => handleSelect()}>
            <ListItemIcon>
              <Add />
            </ListItemIcon>
            <ListItemText primary="Add" />
          </ListItemButton>
        </List>
      </Box>
    </Drawer>
  );
}
