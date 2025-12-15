/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-19 12:09:18
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 03:52:35
 * @FilePath: /tauri/packages/ChatGPT/src/components/ConversationEdit/index.tsx
 */
import TemplateInfo from '@chatgpt/features/Template/components/TemplateInfo';
import { selectTemplates, useTemplateStore } from '@chatgpt/features/Template/templateSlice';
import { type NewConversation } from '@chatgpt/types/conversation';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { Controller, type Resolver, useForm } from 'react-hook-form';
import { type InferOutput, emoji, integer, nullish, number, object, pipe, string } from 'valibot';
import { useShallow } from 'zustand/react/shallow';
import FolderSelect from '../FolderSelect';
import { useTranslation } from 'react-i18next';
import type { ComponentProps } from 'react';
import { cn } from '@chatgpt/lib/utils';
import { FieldError, FieldGroup, FieldLabel, Field } from '../ui/field';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const conversationSchema = object({
  title: string(),
  icon: pipe(string(), emoji()),
  info: nullish(string()),
  templateId: pipe(number(), integer()),
  folderId: nullish(pipe(number(), integer())),
});

export type ConversationForm = InferOutput<typeof conversationSchema>;

const getDefaultValues = (): Partial<NewConversation> => ({
  folderId: null,
});

export interface ConversationEditProps extends Omit<ComponentProps<'form'>, 'id' | 'onSubmit'> {
  initialValues?: NewConversation;
  id: string;
  onSubmit: (newConversation: ConversationForm) => Promise<void>;
}
export default function ConversationEdit({
  initialValues,
  id,
  className,
  onSubmit: submit,
  ...props
}: ConversationEditProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ConversationForm>({
    resolver: valibotResolver(conversationSchema) as Resolver<ConversationForm, unknown>,
    defaultValues: initialValues ?? getDefaultValues(),
  });
  const onSubmit = handleSubmit(submit);
  const templates = useTemplateStore(useShallow(selectTemplates));
  const { t } = useTranslation();
  return (
    <form
      className={cn('grow flex flex-col relative overflow-y-auto', className)}
      {...props}
      id={id}
      onSubmit={onSubmit}
    >
      <FieldGroup>
        <Field>
          <FieldLabel>{t('title')}</FieldLabel>
          <Input required {...register('title', { required: true })} />
          <FieldError errors={[errors.title]} />
        </Field>
        <Field>
          <FieldLabel>{t('icon')}</FieldLabel>
          <Input required {...register('icon', { required: true })} />
          <FieldError errors={[errors.icon]} />
        </Field>
        <Field>
          <FieldLabel>{t('info')}</FieldLabel>
          <Input {...register('info', { required: true })} />
          <FieldError errors={[errors.info]} />
        </Field>
        <Controller
          control={control}
          name="templateId"
          render={({ field: { value, onChange, ...field }, fieldState }) => (
            <Field>
              <FieldLabel>{t('template')}</FieldLabel>
              <Select
                required
                onValueChange={(newValue) => onChange(Number.parseInt(newValue, 10))}
                value={String(value)}
                {...field}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={String(template.id)}>
                      {template.name}
                      <TemplateInfo mode={template.mode} description={template.description} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
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
    </form>
  );
}
