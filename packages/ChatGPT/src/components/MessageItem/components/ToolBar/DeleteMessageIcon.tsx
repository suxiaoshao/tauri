import { MessageActionContext } from '@chatgpt/components/MessageHistory/MessageActionContext';
import { Delete } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { useCallback, useContext } from 'react';
import { ToolSx } from '../../const';
import { useTranslation } from 'react-i18next';

export interface DeleteMessageIconProps {
  id: number;
}
export default function DeleteMessageIcon({ id }: DeleteMessageIconProps) {
  const { onMessageDeleted } = useContext(MessageActionContext);
  const handleClick = useCallback(() => {
    onMessageDeleted?.(id);
  }, [onMessageDeleted, id]);
  const { t } = useTranslation();
  if (!onMessageDeleted) {
    return null;
  }
  return (
    <Tooltip title={t('delete_message')}>
      <IconButton size="small" onClick={handleClick}>
        <Delete fontSize="small" sx={ToolSx} />
      </IconButton>
    </Tooltip>
  );
}
