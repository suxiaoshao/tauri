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
import { Box, FormLabel, IconButton, MenuItem, TextField } from '@mui/material';
import { Controller, FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { type InferInput, any, array, emoji, enum_, nullish, object, pipe, string } from 'valibot';
import AdapterForm from './AdapterForm';
import { Add, Delete } from '@mui/icons-material';

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

  return (
    <FormProvider {...methods}>
      <Box
        sx={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', position: 'relative', overflowY: 'auto', p: 2 }}
        component="form"
        id={id}
        onSubmit={handleSubmit(onSubmit)}
      >
        <TextField
          error={!!errors.name?.message}
          helperText={errors.name?.message}
          {...register('name', { required: true })}
          required
          label="Name"
          fullWidth
        />
        <TextField
          error={!!errors.icon?.message}
          helperText={errors.icon?.message}
          label="Icon"
          required
          {...register('icon', { required: true })}
          fullWidth
          sx={{ mt: 2 }}
        />
        <TextField
          error={!!errors.description?.message}
          helperText={errors.description?.message}
          {...register('description')}
          label="Description"
          fullWidth
          sx={{ mt: 2 }}
        />
        <Controller
          control={control}
          name="mode"
          rules={{ required: true }}
          render={({ field, fieldState }) => (
            <TextField
              error={!!fieldState?.error?.message}
              helperText={fieldState?.error?.message}
              select
              label="Mode"
              required
              fullWidth
              sx={{ mt: 2 }}
              {...field}
            >
              <MenuItem value={Mode.Contextual}>{Mode.Contextual}</MenuItem>
              <MenuItem value={Mode.Single}>{Mode.Single}</MenuItem>
              <MenuItem value={Mode.AssistantOnly}>{Mode.AssistantOnly}</MenuItem>
            </TextField>
          )}
        />
        <AdapterForm />
        <Box sx={{ mt: 2, gap: 2, display: 'flex', alignItems: 'center' }}>
          <FormLabel required>Prompts</FormLabel>
          <IconButton onClick={() => append({ role: Role.assistant, prompt: '' })}>
            <Add />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {fields.map((field, index) => (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'start' }} key={field.id}>
              <Controller
                control={control}
                name={`prompts.${index}.role`}
                rules={{ required: true }}
                render={({ field, fieldState }) => (
                  <TextField
                    error={!!fieldState?.error?.message}
                    helperText={fieldState?.error?.message}
                    select
                    label="Role"
                    required
                    fullWidth
                    sx={{ flex: '1 1 0' }}
                    {...field}
                  >
                    <MenuItem value={Role.assistant}>{Role.assistant}</MenuItem>
                    <MenuItem value={Role.user}>{Role.user}</MenuItem>
                    <MenuItem value={Role.system}>{Role.system}</MenuItem>
                  </TextField>
                )}
              />
              <TextField
                error={!!errors?.prompts?.[index]?.prompt?.message}
                helperText={errors?.prompts?.[index]?.prompt?.message}
                {...register(`prompts.${index}.prompt`, { required: true })}
                label="Prompt"
                fullWidth
                sx={{ flex: '1 1 0' }}
                multiline
                maxRows={4}
              />
              <IconButton sx={{ mt: 1 }} onClick={() => remove(index)}>
                <Delete />
              </IconButton>
            </Box>
          ))}
        </Box>
      </Box>
    </FormProvider>
  );
}
