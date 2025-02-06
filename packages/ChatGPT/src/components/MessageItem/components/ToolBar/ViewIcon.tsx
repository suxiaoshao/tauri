import { MessageActionContext } from '@chatgpt/components/MessageHistory/MessageActionContext';
import { Preview } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { useCallback, useContext } from 'react';
import { ToolSx } from '../../const';

export interface ViewIconProp {
  id: number;
}

export default function ViewIcon({ id }: ViewIconProp) {
  const { onMessageViewed } = useContext(MessageActionContext);
  const handleClick = useCallback(() => {
    onMessageViewed?.(id);
  }, [id, onMessageViewed]);
  if (!onMessageViewed) {
    return null;
  }
  return (
    <Tooltip title="View">
      <IconButton size="small" onClick={handleClick}>
        <Preview fontSize="small" sx={ToolSx} />
      </IconButton>
    </Tooltip>
  );
}
