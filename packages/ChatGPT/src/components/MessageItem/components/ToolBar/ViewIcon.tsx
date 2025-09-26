import { MessageActionContext } from '@chatgpt/components/MessageHistory/MessageActionContext';
import { Preview } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { useCallback, useContext } from 'react';
import { ToolSx } from '../../const';
import { useTranslation } from 'react-i18next';

export interface ViewIconProp {
  id: number;
}

export default function ViewIcon({ id }: ViewIconProp) {
  const { onMessageViewed } = useContext(MessageActionContext);
  const handleClick = useCallback(() => {
    onMessageViewed?.(id);
  }, [id, onMessageViewed]);
  const { t } = useTranslation();
  if (!onMessageViewed) {
    return null;
  }
  return (
    <Tooltip title={t('view_message')}>
      <IconButton size="small" onClick={handleClick}>
        <Preview fontSize="small" sx={ToolSx} />
      </IconButton>
    </Tooltip>
  );
}
