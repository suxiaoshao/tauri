import { Box, Divider, Drawer, List, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import AddConversation from '@chatgpt/features/Adds/AddConversation';
import AddFolder from '@chatgpt/features/Adds/AddFolder';
import { useMemo } from 'react';
import usePlatform from '@chatgpt/hooks/usePlatform';
import ConversationTree from '@chatgpt/features/Conversations';
import Setting from '@chatgpt/features/Setting';

const drawerWidth = 200;

export default function AppDrawer() {
  const platform = usePlatform();
  const headersHeight = useMemo(() => (platform === 'Darwin' ? 28 : 0), [platform]);
  return (
    <Box sx={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}>
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
        open={true}
      >
        <Toolbar data-tauri-drag-region />
        <Box sx={{ overflow: 'auto' }}>
          <ConversationTree />
          <Divider />
          <List>
            <AddConversation.Item />
            <AddFolder.Item />
            <Setting.Item />
          </List>
        </Box>
      </Drawer>
      <Box
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          height: `100%`,
          marginLeft: `${drawerWidth}px`,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
