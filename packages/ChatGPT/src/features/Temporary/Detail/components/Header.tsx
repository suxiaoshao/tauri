import usePlatform from '@chatgpt/hooks/usePlatform';
import { clearTemporaryConversation } from '@chatgpt/service/temporaryConversation/mutation';
import { type ConversationTemplate } from '@chatgpt/types/conversationTemplate';
import { BrushCleaning } from 'lucide-react';
import { useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { match } from 'ts-pattern';
import SaveConversation from './SaveConversation';
import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipContent, TooltipTrigger } from '@chatgpt/components/ui/tooltip';
import { Button } from '@chatgpt/components/ui/button';
import { Avatar, AvatarFallback } from '@chatgpt/components/ui/avatar';

export interface TemporaryHeaderProps {
  template: ConversationTemplate;
  persistentId: number | null;
}

export default function TemporaryHeader({ template, persistentId }: TemporaryHeaderProps) {
  const platform = usePlatform();

  const handleClear = useCallback(async () => {
    await clearTemporaryConversation({ persistentId });
  }, [persistentId]);
  useHotkeys(
    match(platform)
      .with('macos', () => ['Meta+l'])
      .otherwise(() => ['Control+l']),
    (event) => {
      event.preventDefault();
      handleClear();
    },
    {
      enableOnFormTags: ['INPUT', 'TEXTAREA'],
    },
    [platform, handleClear],
  );
  const { t } = useTranslation();
  return (
    <div className="w-full flex p-2 justify-center shadow items-center" data-tauri-drag-region>
      <Avatar data-tauri-drag-region>
        <AvatarFallback className="bg-transparent">{template.icon}</AvatarFallback>
      </Avatar>
      <div className="grow flex items-center ml-1 gap-2" data-tauri-drag-region>
        <span className="text-xl leading-snug font-medium" data-tauri-drag-region>
          {template.name}
        </span>
        <span className="text-sm text-accent-foreground" data-tauri-drag-region>
          {template.description}
        </span>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={handleClear}>
            <BrushCleaning />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('clear_messages')}</TooltipContent>
      </Tooltip>
      <SaveConversation persistentId={persistentId} />
    </div>
  );
}
