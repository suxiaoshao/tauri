import { Preview } from '@mui/icons-material';
import { useCallback } from 'react';
import { ToolSx } from '../../const';
import { WebviewWindow } from '@tauri-apps/api/window';

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
  return <Preview onClick={handleClick} fontSize={'small'} sx={ToolSx} />;
}
