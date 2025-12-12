import FolderSelect from '@chatgpt/components/FolderSelect';
import { Button } from '@chatgpt/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@chatgpt/components/ui/dialog';
import { FieldError, FieldGroup, FieldLabel, Field } from '@chatgpt/components/ui/field';
import { Tooltip, TooltipContent, TooltipTrigger } from '@chatgpt/components/ui/tooltip';
import { useBoolean } from '@chatgpt/hooks/use-boolean';
import { type MoveConversationParams, moveConversation } from '@chatgpt/service/chat/mutation';
import { type Conversation } from '@chatgpt/types/conversation';
import { FolderInput } from 'lucide-react';
import { useCallback } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export interface MoveConversationProps {
  conversation: Conversation;
}

export default function MoveConversation({ conversation }: MoveConversationProps) {
  const [open, { set, setFalse }] = useBoolean();
  const { control, handleSubmit } = useForm<Pick<MoveConversationParams, 'folderId'>>({
    defaultValues: {
      folderId: conversation.folderId,
    },
  });
  const onSubmit = useCallback(
    async ({ folderId }: Pick<MoveConversationParams, 'folderId'>) => {
      await moveConversation({ folderId, conversationId: conversation.id });
      setFalse();
    },
    [conversation.id, setFalse],
  );
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={set}>
      <Tooltip>
        <DialogTrigger asChild>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon">
              <FolderInput />
            </Button>
          </TooltipTrigger>
        </DialogTrigger>
        <TooltipContent>{t('move')}</TooltipContent>
      </Tooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('move_conversation')}</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              control={control}
              name="folderId"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>{t('folder')}</FieldLabel>
                  <FolderSelect {...field} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter>
            <Button type="submit">{t('move')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
