import { clearConversation, deleteConversation } from '@chatgpt/service/chat/mutation';
import { type Conversation } from '@chatgpt/types/conversation';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ExportConversation from './ExportConversation';
import MoveConversation from './MoveConversation';
import UpdateConversation from './UpdateConversation';
import { useHotkeys } from 'react-hotkeys-hook';
import usePlatform from '@chatgpt/hooks/usePlatform';
import { match } from 'ts-pattern';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback } from '@chatgpt/components/ui/avatar';
import { Button } from '@chatgpt/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@chatgpt/components/ui/tooltip';
import { BrushCleaning, Copy, Trash } from 'lucide-react';
export interface ConversationHeaderProps {
  conversation: Conversation;
}

export default function ConversationHeader({ conversation }: ConversationHeaderProps) {
  const platform = usePlatform();
  const handleDelete = useCallback(async () => {
    await deleteConversation({ id: conversation.id });
  }, [conversation.id]);
  const navigate = useNavigate();
  const handleCopy = useCallback(() => {
    navigate('/add/conversation', { state: { ...conversation, id: undefined } });
  }, [conversation, navigate]);
  const handleClear = useCallback(async () => {
    await clearConversation({ id: conversation.id });
  }, [conversation.id]);

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
    <div className="w-full flex p-2 justify-center items-center shadow" data-tauri-drag-region>
      <Avatar data-tauri-drag-region>
        <AvatarFallback className="bg-transparent">{conversation.icon}</AvatarFallback>
      </Avatar>
      <div className="grow flex items-center gap-2 ml-2" data-tauri-drag-region>
        <span className="text-xl" data-tauri-drag-region>
          {conversation.title}
        </span>
        <span className="text-sm text-accent-foreground" data-tauri-drag-region>
          {conversation.info}
        </span>
      </div>
      <UpdateConversation conversation={conversation} />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={handleDelete}>
            <Trash />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('delete')}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={handleCopy}>
            <Copy />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('copy_to_new_conversation')}</TooltipContent>
      </Tooltip>
      <MoveConversation conversation={conversation} />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={handleClear}>
            <BrushCleaning />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('clear_messages')}</TooltipContent>
      </Tooltip>
      <ExportConversation conversation={conversation} />
    </div>
  );
}
