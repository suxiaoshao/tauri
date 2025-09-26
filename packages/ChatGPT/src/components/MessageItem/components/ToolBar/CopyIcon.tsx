import { ContentCopy } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { enqueueSnackbar } from 'notify';
import { useCallback } from 'react';
import { ToolSx } from '../../const';
import { useTranslation } from 'react-i18next';

export interface CopyIconProps {
  content: string;
}

export default function CopyIcon({ content }: CopyIconProps) {
  const { t } = useTranslation();
  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(content);
    enqueueSnackbar(t('copied_to_clipboard'), { variant: 'success' });
  }, [content, t]);
  return (
    <Tooltip title={t('copy')}>
      <IconButton size="small" onClick={handleCopy}>
        <ContentCopy fontSize="small" sx={ToolSx} />
      </IconButton>
    </Tooltip>
  );
}
