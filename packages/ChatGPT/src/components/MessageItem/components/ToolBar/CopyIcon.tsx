import { ContentCopy } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { enqueueSnackbar } from 'notify';
import { useCallback } from 'react';
import { ToolSx } from '../../const';

export interface CopyIconProps {
  content: string;
}

export default function CopyIcon({ content }: CopyIconProps) {
  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(content);
    enqueueSnackbar('Copied to clipboard', { variant: 'success' });
  }, [content]);
  return (
    <Tooltip title="Copy">
      <IconButton size="small" onClick={handleCopy}>
        <ContentCopy fontSize={'small'} sx={ToolSx} />
      </IconButton>
    </Tooltip>
  );
}
