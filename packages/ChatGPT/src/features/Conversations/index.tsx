import { Box, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Drawer, Divider } from '@mui/material';
import { Add, ChevronRight, ExpandMore, Settings } from '@mui/icons-material';
import {
  selectConversations,
  selectSelectedNodeId,
  setSelected,
} from '@chatgpt/features/Conversations/conversationSlice';
import { useAppDispatch, useAppSelector } from '@chatgpt/app/hooks';
import { useCallback, useMemo } from 'react';
import { invoke } from '@tauri-apps/api';
import usePlatform from '@chatgpt/hooks/usePlatform';
import { TreeView } from '@mui/lab';
import FolderItem from './components/FolderItem';
import ConversationItem from './components/ConversationItem';
import { getSelectedFromNodeId } from '@chatgpt/utils/chatData';
import { useNavigate, useMatch } from 'react-router-dom';

export interface DrawerProps {
  open: boolean;
  drawerWidth: number;
}

export default function AppDrawer({ open, drawerWidth }: DrawerProps) {
  const platform = usePlatform();
  const headersHeight = useMemo(() => (platform === 'Darwin' ? 28 : 0), [platform]);
  const { conversations, folders } = useAppSelector(selectConversations);
  const selectedNodeId = useAppSelector(selectSelectedNodeId);
  const dispatch = useAppDispatch();
  const handleSelect = useCallback(
    (event: React.SyntheticEvent, nodeIds: string) => {
      dispatch(setSelected(getSelectedFromNodeId(nodeIds)));
    },
    [dispatch],
  );
  const content = useMemo(() => {
    return (
      <TreeView
        aria-label="file system navigator"
        defaultCollapseIcon={<ExpandMore />}
        defaultExpandIcon={<ChevronRight />}
        sx={{ flexGrow: 1, width: '100%', overflowY: 'auto' }}
        selected={selectedNodeId}
        onNodeSelect={handleSelect}
      >
        {folders.map((f) => (
          <FolderItem key={f.id} folder={f} />
        ))}
        {conversations.map((c) => (
          <ConversationItem key={c.id} conversation={c} />
        ))}
      </TreeView>
    );
  }, [conversations, folders, handleSelect, selectedNodeId]);
  const handleSetting = useCallback(async () => {
    await invoke('plugin:config|create_setting_window');
  }, []);
  const navigate = useNavigate();
  const matchAdd = useMatch('/add');
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
        {content}
        <Divider />
        <List>
          <ListItemButton
            onClick={() => {
              if (matchAdd) {
                navigate('/');
              } else {
                navigate('/add');
              }
            }}
            selected={matchAdd !== null}
          >
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
