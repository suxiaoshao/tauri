import { Box, Divider, List, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import AddConversation from '@chatgpt/features/Adds/AddConversation';
import AddFolder from '@chatgpt/features/Adds/AddFolder';
import { useMemo, useState } from 'react';
import { Resizable } from 'react-resizable';
import usePlatform from '@chatgpt/hooks/usePlatform';
import ConversationTree from '@chatgpt/features/Conversations';
import Setting from '@chatgpt/features/Setting';
import 'react-resizable/css/styles.css';
export default function AppDrawer() {
  const [drawerWidth, setDrawerWidth] = useState(250);
  const platform = usePlatform();
  const headersHeight = useMemo(() => (platform === 'Darwin' ? 28 : 0), [platform]);
  return (
    <Box sx={{ width: '100%', height: '100%', backgroundColor: 'transparent', display: 'flex', flexDirection: 'row' }}>
      <Resizable
        width={drawerWidth}
        onResize={(_, { size }) => {
          setDrawerWidth(size.width);
        }}
        height={window.innerHeight}
        axis="x"
        handle={(_, ref) => (
          <Box
            ref={ref}
            sx={{
              width: 10,
              height: '100%',
              backgroundColor: 'transparent',
              cursor: 'ew-resize',
              position: 'absolute',
              right: -5,
              top: 0,
            }}
          />
        )}
      >
        <Box
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiToolbar-root': {
              height: `${headersHeight}px`,
              minHeight: `${headersHeight}px`,
              backgroundColor: 'transparent',
            },
            backgroundColor: 'transparent',
          }}
          className="box"
          data-tauri-drag-region
        >
          <Toolbar sx={{}} data-tauri-drag-region />
          <Box sx={{ overflow: 'auto' }}>
            <ConversationTree />
            <Divider />
            <List>
              <AddConversation.Item />
              <AddFolder.Item />
              <Setting.Item />
            </List>
          </Box>
        </Box>
      </Resizable>
      <Divider orientation="vertical" />
      <Box
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          height: `100%`,
        }}
      >
        <Outlet />D
      </Box>
    </Box>
  );
}
