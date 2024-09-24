import { MessageActionContext } from '@chatgpt/components/MessageHistory/MessageActionContext';
import { Delete } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { useCallback, useContext } from 'react';
import { ToolSx } from '../../const';

export interface DeleteMessageIconProps {
  id: number;
}
export default function DeleteMessageIcon({ id }: DeleteMessageIconProps) {
  const { onMessageDeleted } = useContext(MessageActionContext);
  const handleClick = useCallback(() => {
    onMessageDeleted?.(id);
  }, [onMessageDeleted, id]);
  if (!onMessageDeleted) {
    return null;
  }
  return (
    <Tooltip title="Delete message">
      <IconButton size="small" onClick={handleClick}>
        <Delete fontSize="small" sx={ToolSx} />
      </IconButton>
    </Tooltip>
  );
}
