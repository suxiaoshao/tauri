import { Delete } from '@mui/icons-material';
import { ToolSx } from '../../const';
import { useCallback, useContext } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { MessageActionContext } from '@chatgpt/components/MessageHistory';

export interface DeleteMessageIconProps {
  id: number;
}
export default function DeleteMessageIcon({ id }: DeleteMessageIconProps) {
  const { onMessageDeleted } = useContext(MessageActionContext);
  const handleClick = useCallback(async () => {
    onMessageDeleted?.(id);
  }, [onMessageDeleted, id]);
  if (!onMessageDeleted) {
    return null;
  }
  return (
    <Tooltip title="Delete message">
      <IconButton size="small" onClick={handleClick}>
        <Delete fontSize={'small'} sx={ToolSx} />
      </IconButton>
    </Tooltip>
  );
}
