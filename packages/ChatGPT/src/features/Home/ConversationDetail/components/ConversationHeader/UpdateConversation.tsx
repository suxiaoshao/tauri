/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-28 20:49:43
 * @FilePath: /tauri/packages/ChatGPT/src/features/Home/ConversationDetail/components/ConversationHeader/UpdateConversation.tsx
 */
import ConversationEdit, { type ConversationForm } from '@chatgpt/components/ConversationEdit';
import { Button } from '@chatgpt/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@chatgpt/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@chatgpt/components/ui/tooltip';
import { useBoolean } from '@chatgpt/hooks/use-boolean';
import { updateConversation } from '@chatgpt/service/chat/mutation';
import { type Conversation, type NewConversation } from '@chatgpt/types/conversation';
import { Edit as EditIcon } from 'lucide-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export interface UpdateConversationProps {
  conversation: Conversation;
}

export default function UpdateConversation({ conversation }: UpdateConversationProps) {
  const [open, { set, setFalse }] = useBoolean();

  const handleSubmit = useCallback(
    async ({ info, ...data }: ConversationForm) => {
      await updateConversation({
        data: {
          ...data,
          info: info?.trim(),
        } satisfies NewConversation,
        id: conversation.id,
      });
      setFalse();
    },
    [conversation.id, setFalse],
  );
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={set}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <EditIcon />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>{t('modify')}</TooltipContent>
      </Tooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('modify_conversation')}</DialogTitle>
        </DialogHeader>
        <ConversationEdit initialValues={conversation} id="conversation-form" onSubmit={handleSubmit} />

        <DialogFooter>
          <Button variant="default" type="submit" form="conversation-form">
            {t('save_changes')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
