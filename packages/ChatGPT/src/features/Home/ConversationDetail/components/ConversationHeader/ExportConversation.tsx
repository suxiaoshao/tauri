/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2023-10-13 12:58:34
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2023-11-07 12:29:49
 * @FilePath: /tauri/packages/ChatGPT/src/features/Home/ConversationDetail/components/ConversationHeader/ExportConversation.tsx
 */
import { useConversationStore } from '@chatgpt/features/Conversations/conversationSlice';
import { type ExportConversationParams, ExportType, exportConversation } from '@chatgpt/service/chat/mutation';
import { type Conversation } from '@chatgpt/types/conversation';
import {} from '@tauri-apps/api';
import { enqueueSnackbar } from 'notify';
import { useCallback } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useShallow } from 'zustand/react/shallow';
import * as dialog from '@tauri-apps/plugin-dialog';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@chatgpt/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@chatgpt/components/ui/tooltip';
import { Button } from '@chatgpt/components/ui/button';
import { useBoolean } from '@chatgpt/hooks/use-boolean';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@chatgpt/components/ui/select';
import { FieldError, FieldGroup, FieldLabel, Field } from '@chatgpt/components/ui/field';
import { Share } from 'lucide-react';

export interface ExportConversationProps {
  conversation: Conversation;
}
async function selectFolder() {
  const result = await dialog.open({
    directory: true,
    canCreateDirectories: true,
  });
  return result as string;
}

export default function ExportConversation({ conversation }: ExportConversationProps) {
  const { t } = useTranslation();
  const fetchConversations = useConversationStore(useShallow(({ fetchConversations }) => fetchConversations));
  const [open, { set, setFalse }] = useBoolean();
  const { control, handleSubmit } = useForm<Pick<ExportConversationParams, 'exportType'>>({});
  const onSubmit = useCallback(
    async ({ exportType }: Pick<ExportConversationParams, 'exportType'>) => {
      const path = await selectFolder();
      await exportConversation({ path, exportType, id: conversation.id });
      fetchConversations();
      setFalse();
      await enqueueSnackbar(t('exported_successfully'), { variant: 'success' });
    },
    [conversation.id, fetchConversations, setFalse, t],
  );
  return (
    <Dialog open={open} onOpenChange={set}>
      <Tooltip>
        <DialogTrigger asChild>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon">
              <Share />
            </Button>
          </TooltipTrigger>
        </DialogTrigger>
        <TooltipContent>{t('export')}</TooltipContent>
      </Tooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('export_messages')}</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              control={control}
              name="exportType"
              rules={{ required: true }}
              render={({ field: { onChange, ...field }, fieldState }) => (
                <Field>
                  <FieldLabel>{t('export_type')}</FieldLabel>
                  <Select onValueChange={onChange} {...field}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value={ExportType.JSON}>{ExportType.JSON}</SelectItem>
                        <SelectItem value={ExportType.CSV}>{ExportType.CSV}</SelectItem>
                        <SelectItem value={ExportType.TXT}>{ExportType.TXT}</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter>
            <Button type="submit">{t('export')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
