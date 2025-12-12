/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-01-29 21:03:59
 * @FilePath: /tauri/packages/ChatGPT/src/components/FolderEdit/index.tsx
 */
import { type NewFolder } from '@chatgpt/types/folder';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { integer, nullish, number, object, pipe, string, type InferInput } from 'valibot';
import FolderSelect from '../FolderSelect';
import { useTranslation } from 'react-i18next';
import { cn } from '@chatgpt/lib/utils';
import type { ComponentProps } from 'react';
import { FieldError, FieldGroup, FieldLabel, Field } from '../ui/field';
import { Input } from '../ui/input';

const folderSchema = object({ name: string(), parentId: nullish(pipe(number(), integer())) });

export type FolderForm = InferInput<typeof folderSchema>;

const DefaultValues: Partial<NewFolder> = {};

export interface FolderEditProps extends Omit<ComponentProps<'form'>, 'component' | 'id' | 'onSubmit'> {
  initialValues?: NewFolder;
  id: string;
  onSubmit: (newFolder: FolderForm) => Promise<void>;
}
export default function FolderEdit({ initialValues, id, className, onSubmit: submit, ...props }: FolderEditProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FolderForm>({
    resolver: valibotResolver(folderSchema) as Resolver<FolderForm, unknown>,
    defaultValues: initialValues ?? DefaultValues,
  });
  const onSubmit = handleSubmit(submit);
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
          <Input {...register('name', { required: true })} />
          {errors.name && <FieldError errors={[errors.name]} />}
        </Field>
        <Controller
          control={control}
          name="parentId"
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
