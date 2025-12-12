import { MessageActionContext } from '@chatgpt/components/MessageHistory/MessageActionContext';
import { Trash } from 'lucide-react';
import { useCallback, useContext } from 'react';
import { toolClassName } from '../../const';
import { useTranslation } from 'react-i18next';
import { Button } from '@chatgpt/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@chatgpt/components/ui/tooltip';

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
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="icon-sm" variant="ghost" onClick={handleClick}>
          <Trash className={toolClassName} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t('delete_message')}</TooltipContent>
    </Tooltip>
  );
}
