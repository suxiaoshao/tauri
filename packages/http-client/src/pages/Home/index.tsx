import { Box, List, ListItemButton, ListItemText, TextField } from '@mui/material';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-shell';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { useEffect, useState } from 'react';
import { useKey } from 'react-use';
import { match } from 'ts-pattern';
import { LogicalSize } from '@tauri-apps/api/window';
const appWindow = getCurrentWebviewWindow();

interface AppPath {
  desc: string | null;
  icon: string | null;
  path: string;
  name: string;
}

export default function Home() {
  const [appPath, setAppPath] = useState([] as AppPath[]);
  const [selectIndex, setSelectIndex] = useState(0);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
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
    if (ref) {
      ref?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }, [ref]);
  useEffect(() => {
    if (appPath.length > 0) {
      appWindow.setSize(new LogicalSize(800, 580));
      setSelectIndex(0);
    } else {
      appWindow.setSize(new LogicalSize(800, 56));
    }
  }, [appPath]);
  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff00' }}>
      <TextField
        placeholder="搜索"
        fullWidth
        slotProps={{
          htmlInput: { spellcheck: 'false' },
        }}
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
          <ListItemButton
            ref={match(index)
              .with(selectIndex, () => setRef)
              // eslint-disable-next-line no-useless-undefined
              .otherwise(() => undefined)}
            key={path}
            selected={index === selectIndex}
          >
            <ListItemText primary={name} secondary={desc ?? path} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
