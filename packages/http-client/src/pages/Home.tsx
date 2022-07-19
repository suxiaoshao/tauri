import { Box, List, ListItemButton, ListItemText, TextField } from '@mui/material';
import { invoke } from '@tauri-apps/api';
import { appWindow, LogicalSize } from '@tauri-apps/api/window';
import { open } from '@tauri-apps/api/shell';
import { useEffect, useState } from 'react';
import { useKey } from 'react-use';

interface AppPath {
  desc: string | null;
  icon: string | null;
  path: string;
  name: string;
}

export default function Home() {
  const [appPath, setAppPath] = useState([] as AppPath[]);
  const [selectIndex, setSelectIndex] = useState(0);
  const add = () => {
    if (selectIndex < appPath.length - 1) {
      setSelectIndex((value) => value + 1);
    }
  };
  const sub = () => {
    if (selectIndex >= 1) {
      setSelectIndex((value) => value - 1);
    }
  };
  useKey('ArrowUp', sub, undefined, [selectIndex, appPath]);
  useKey('ArrowDown', add, undefined, [selectIndex, appPath]);
  useKey(
    'Enter',
    () => {
      const item = appPath.at(selectIndex);
      if (item) {
        open(item.path);
      }
    },
    undefined,
    [selectIndex, appPath],
  );
  useEffect(() => {
    (async () => {
      if (appPath.length !== 0) {
        appWindow.setSize(new LogicalSize(800, 580));
        setSelectIndex(0);
      } else {
        appWindow.setSize(new LogicalSize(800, 36));
      }
    })();
  }, [appPath]);
  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <TextField
        placeholder="搜索"
        fullWidth
        onChange={async (e) => {
          const data: AppPath[] = await invoke('app_search', { path: e.target.value });
          setAppPath(data);
          console.log(data);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
          }
        }}
      />
      <List sx={{ flex: '1 1 0', padding: 0, overflowY: 'auto' }}>
        {appPath.map(({ name, desc, path }, index) => (
          <ListItemButton key={path} selected={index === selectIndex}>
            <ListItemText primary={name} secondary={desc ?? path} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
