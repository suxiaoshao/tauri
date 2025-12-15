import { MessageActionContext } from '@chatgpt/components/MessageHistory/MessageActionContext';
import { Eye } from 'lucide-react';
import { useCallback, useContext } from 'react';
import { toolClassName } from '../../const';
import { useTranslation } from 'react-i18next';
import { Button } from '@chatgpt/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@chatgpt/components/ui/tooltip';

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
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-sm" onClick={handleClick}>
          <Eye fontSize="small" className={toolClassName} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t('view_message')}</TooltipContent>
    </Tooltip>
  );
}
