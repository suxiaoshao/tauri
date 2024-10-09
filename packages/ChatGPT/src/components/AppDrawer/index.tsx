/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao 48886207+suxiaoshao@users.noreply.github.com
 * @LastEditTime: 2024-10-07 10:24:14
 * @FilePath: /tauri/packages/ChatGPT/src/components/AppDrawer/index.tsx
 */
import AddConversation from '@chatgpt/features/Adds/AddConversation';
import AddFolder from '@chatgpt/features/Adds/AddFolder';
import ConversationTree from '@chatgpt/features/Conversations';
import Setting from '@chatgpt/features/Setting';
import ConversationTemplateList from '@chatgpt/features/Template/List';
import usePlatform from '@chatgpt/hooks/usePlatform';
import { Box, Divider, List, Toolbar } from '@mui/material';
import { useMemo, useState } from 'react';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { Outlet } from 'react-router-dom';
import { match } from 'ts-pattern';
export default function AppDrawer() {
  const [drawerWidth, setDrawerWidth] = useState(250);
  const platform = usePlatform();
  const headersHeight = useMemo(() => {
    return match(platform)
      .with('macos', () => 28)
      .otherwise(() => 0);
  }, [platform]);
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
              {/* eslint-disable-next-line label-has-associated-control */}
              <AddConversation.Item />
              {/* eslint-disable-next-line label-has-associated-control */}
              <AddFolder.Item />
              {/* eslint-disable-next-line label-has-associated-control */}
              <ConversationTemplateList.Item />
              {/* eslint-disable-next-line label-has-associated-control */}
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
        <Outlet />
      </Box>
    </Box>
  );
}
