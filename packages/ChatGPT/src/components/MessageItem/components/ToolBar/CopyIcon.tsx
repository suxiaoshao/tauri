import { enqueueSnackbar } from 'notify';
import { useCallback } from 'react';
import { toolClassName } from '../../const';
import { useTranslation } from 'react-i18next';
import { Button } from '@chatgpt/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@chatgpt/components/ui/tooltip';
import { Copy } from 'lucide-react';

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
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-sm" onClick={handleCopy}>
          <Copy fontSize="small" className={toolClassName} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t('copy')}</TooltipContent>
    </Tooltip>
  );
}
