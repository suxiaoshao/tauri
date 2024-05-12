import { Preview } from '@mui/icons-material';
import { useCallback } from 'react';
import { ToolSx } from '../../const';
import { WebviewWindow } from '@tauri-apps/api/window';
import { IconButton } from '@mui/material';

export interface ViewIconProp {
  id: number;
}

export default function ViewIcon({ id }: ViewIconProp) {
  const handleClick = useCallback(() => {
    new WebviewWindow(`message-${id}`, {
      url: `/message/${id}`,
      title: `message-${id}`,
      transparent: true,
      decorations: false,
    });
  }, [id]);
  return (
    <IconButton size="small" onClick={handleClick}>
      <Preview fontSize={'small'} sx={ToolSx} />
    </IconButton>
  );
}
