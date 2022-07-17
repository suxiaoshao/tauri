import { Box, List, ListItem, ListItemText, TextField } from '@mui/material';
import { invoke } from '@tauri-apps/api';
import { appWindow, LogicalSize } from '@tauri-apps/api/window';
import { useEffect, useState } from 'react';

interface AppPath {
  desc: string | null;
  icon: string | null;
  path: string;
  name: string;
}

export default function Home() {
  const [appPath, setAppPath] = useState([] as AppPath[]);
  useEffect(() => {
    (async () => {
      if (appPath.length !== 0) {
        appWindow.setSize(new LogicalSize(800, 580));
      } else {
        appWindow.setSize(new LogicalSize(800, 36));
      }
    })();
  }, [appPath]);
  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <TextField
        placeholder="搜索"
        fullWidth
        onChange={async (e) => {
          const data: AppPath[] = await invoke('app_search', { path: e.target.value });
          setAppPath(data);
          console.log(data);
        }}
      />
      <List>
        {appPath.map(({ name, desc, path }) => (
          <ListItem key={path}>
            <ListItemText primary={name} secondary={desc} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
