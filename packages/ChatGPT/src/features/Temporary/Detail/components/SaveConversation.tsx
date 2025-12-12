import FolderSelect from '@chatgpt/components/FolderSelect';
import { Button } from '@chatgpt/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@chatgpt/components/ui/tooltip';
import usePlatform from '@chatgpt/hooks/usePlatform';
import { saveTemporaryConversation } from '@chatgpt/service/temporaryConversation/mutation';
import { Save } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { object, string, pipe, emoji, number, integer, type InferInput, nullable } from 'valibot';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@chatgpt/components/ui/dialog';
import { useBoolean } from '@chatgpt/hooks/use-boolean';
import { Field, FieldError, FieldGroup, FieldLabel } from '@chatgpt/components/ui/field';
import { SidebarProvider } from '@chatgpt/components/ui/sidebar';
import { Input } from '@chatgpt/components/ui/input';

const saveConversationSchema = object({
  title: string(),
  icon: pipe(string(), emoji()),
  info: nullable(string()),
  folderId: nullable(pipe(number(), integer())),
});

export type SaveConversationForm = InferInput<typeof saveConversationSchema>;

export interface SaveConversationProps {
  persistentId: number | null;
}

export default function SaveConversation({ persistentId }: SaveConversationProps) {
  const platform = usePlatform();
  const [open, { set, setFalse, setTrue }] = useBoolean(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
    register,
  } = useForm<SaveConversationForm>({
    defaultValues: {},
  });
  const onSubmit = handleSubmit(async ({ folderId, title, icon, info }: SaveConversationForm) => {
    await saveTemporaryConversation({ data: { folderId, icon, info, title, persistentId } });
    setFalse();
  });
  useHotkeys(
    match(platform)
      .with('macos', () => ['Meta+s'])
      .otherwise(() => ['Control+s']),
    (event) => {
      event.preventDefault();
      setTrue();
    },
    {
      enableOnFormTags: ['INPUT', 'TEXTAREA'],
    },
    [platform, setTrue],
  );
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={set}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Save />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>{t('save_conversation')}</TooltipContent>
      </Tooltip>
      <DialogContent onSubmit={onSubmit}>
        <DialogHeader>
          <DialogTitle>{t('save_conversation')}</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <FieldGroup className="overflow-y-auto h-[500px]">
            <Field>
              <FieldLabel>{t('title')}</FieldLabel>
              <Input {...register('title', { required: true })} required />
              <FieldError errors={[errors.title]} />
            </Field>
            <Field>
              <FieldLabel>{t('icon')}</FieldLabel>
              <Input {...register('icon', { required: true })} required />
              <FieldError errors={[errors.icon]} />
            </Field>
            <Field>
              <FieldLabel>{t('info')}</FieldLabel>
              <Input {...register('info')} />
              <FieldError errors={[errors.info]} />
            </Field>
            <SidebarProvider className="min-h-auto" defaultOpen={false}>
              <Controller
                control={control}
                name="folderId"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t('folder')}</FieldLabel>
                    <FolderSelect {...field} />
                    <FieldError errors={[errors.folderId]} />
                  </Field>
                )}
              />
            </SidebarProvider>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
