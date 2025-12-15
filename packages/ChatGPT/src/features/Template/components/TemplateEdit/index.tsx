/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-29 06:38:37
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 02:43:52
 * @FilePath: /tauri/packages/ChatGPT/src/features/Template/Detail/components/Edit.tsx
 */
import { Mode, Role } from '@chatgpt/types/common';
import { type ConversationTemplate } from '@chatgpt/types/conversationTemplate';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { Controller, FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { type InferInput, any, array, emoji, enum_, nullish, object, pipe, string } from 'valibot';
import AdapterForm from './AdapterForm';
import { useTranslation } from 'react-i18next';
import { getModeKey } from '@chatgpt/utils/getModeKey';
import { getRoleKey } from '@chatgpt/utils/getRoleKey';
import { Field, FieldError, FieldGroup, FieldLabel } from '@chatgpt/components/ui/field';
import { Input } from '@chatgpt/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@chatgpt/components/ui/select';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from '@chatgpt/components/ui/input-group';
import { XIcon } from 'lucide-react';
import { Button } from '@chatgpt/components/ui/button';

const templateSchema = object({
  name: string(),
  icon: pipe(string(), emoji()),
  description: nullish(string()),
  mode: enum_(Mode),
  adapter: string(),
  template: any(),
  prompts: array(
    object({
      role: enum_(Role),
      prompt: string(),
    }),
  ),
});

export type TemplateForm = InferInput<typeof templateSchema>;

const getDefaultValues = (): Partial<TemplateForm> => ({
  mode: Mode.Contextual,
});

export interface TemplateEditProps {
  initialValues?: ConversationTemplate;
  id: string;
  onSubmit: (newTemplate: TemplateForm) => Promise<void>;
}

export default function TemplateEdit({ initialValues, id, onSubmit }: TemplateEditProps) {
  const methods = useForm<TemplateForm>({
    resolver: valibotResolver(templateSchema),
    defaultValues: initialValues ?? getDefaultValues(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'prompts',
  });

  const { t } = useTranslation();

  return (
    <FormProvider {...methods}>
      <form className="flex-[1_1_0] overflow-y-auto relative p-4" id={id} onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Field>
            <FieldLabel>{t('name')}</FieldLabel>
            <Input required placeholder={t('name')} {...register('name', { required: true })} />
            <FieldError errors={[errors.name]} />
          </Field>
          <Field>
            <FieldLabel>{t('icon')}</FieldLabel>
            <Input required placeholder={t('icon')} {...register('icon', { required: true })} />
            <FieldError errors={[errors.icon]} />
          </Field>
          <Field>
            <FieldLabel>{t('description')}</FieldLabel>
            <Input placeholder={t('description')} {...register('description')} />
            <FieldError errors={[errors.description]} />
          </Field>
          <Controller
            control={control}
            name="mode"
            rules={{ required: true }}
            render={({ field: { onChange, ...field }, fieldState }) => (
              <Field>
                <FieldLabel>{t('mode')}</FieldLabel>
                <Select onValueChange={onChange} {...field}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('mode')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Mode.Contextual}>{t(getModeKey(Mode.Contextual))}</SelectItem>
                    <SelectItem value={Mode.Single}>{t(getModeKey(Mode.Single))}</SelectItem>
                    <SelectItem value={Mode.AssistantOnly}>{t(getModeKey(Mode.AssistantOnly))}</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <AdapterForm />
          <Field>
            <FieldLabel>{t('prompts')}</FieldLabel>
            <FieldGroup className="gap-4">
              {fields.map((field, index) => (
                <InputGroup key={field.id}>
                  <InputGroupTextarea
                    {...register(`prompts.${index}.prompt`, { required: true })}
                    placeholder={t('prompt')}
                    rows={4}
                  />
                  <InputGroupAddon align="block-start">
                    <Controller
                      control={control}
                      name={`prompts.${index}.role`}
                      rules={{ required: true }}
                      render={({ field: { onChange, ...field } }) => (
                        <Select onValueChange={onChange} {...field}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('role')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={Role.assistant}>{t(getRoleKey(Role.assistant))}</SelectItem>
                            <SelectItem value={Role.user}>{t(getRoleKey(Role.user))}</SelectItem>
                            <SelectItem value={Role.developer}>{t(getRoleKey(Role.developer))}</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <InputGroupButton className="ml-auto" variant="ghost" size="icon-sm" onClick={() => remove(index)}>
                      <XIcon />
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ role: Role.assistant, prompt: '' })}
              >
                {t('add', { name: t('prompt') })}
              </Button>
            </FieldGroup>
          </Field>
        </FieldGroup>
      </form>
    </FormProvider>
  );
}
