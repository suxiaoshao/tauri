/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-29 06:38:37
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 02:43:52
 * @FilePath: /tauri/packages/ChatGPT/src/features/Template/Detail/components/Edit.tsx
 */
import { useAppSelector } from '@chatgpt/app/hooks';
import store from '@chatgpt/app/store';
import NumberField from '@chatgpt/components/NumberField';
import { selectModels } from '@chatgpt/features/Setting/configSlice';
import { Mode, Role } from '@chatgpt/types/common';
import { ConversationTemplate } from '@chatgpt/types/conversation_template';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { Add, Delete } from '@mui/icons-material';
import { Box, Checkbox, FormControlLabel, FormLabel, IconButton, MenuItem, TextField } from '@mui/material';
import { useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Input, array, emoji, enum_, integer, maxValue, minValue, nullish, number, object, string } from 'valibot';

const templateSchema = object({
  name: string(),
  icon: string([emoji()]),
  description: nullish(string()),
  mode: enum_(Mode),
  model: string(),
  temperature: number([minValue(0), maxValue(1)]),
  topP: number([minValue(0), maxValue(1)]),
  n: number([minValue(1), integer()]),
  maxTokens: nullish(number([minValue(1), integer()])),
  presencePenalty: number([minValue(-2), maxValue(2)]),
  frequencyPenalty: number([minValue(-2), maxValue(2)]),
  prompts: array(
    object({
      prompt: string(),
      role: enum_(Role),
    }),
  ),
});

export type TemplateForm = Input<typeof templateSchema>;

const getDefaultValues = (): Partial<TemplateForm> => ({
  mode: Mode.Contextual,
  model: store.getState().config.models.at(0),
  temperature: 1,
  topP: 1,
  n: 1,
  presencePenalty: 0,
  frequencyPenalty: 0,
});

export interface TemplateEditProps {
  initialValues?: ConversationTemplate;
  id: string;
  onSubmit: (newTemplate: TemplateForm) => Promise<void>;
}

export default function TemplateEdit({ initialValues, id, onSubmit }: TemplateEditProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<TemplateForm>({
    resolver: valibotResolver(templateSchema),
    defaultValues: initialValues ?? getDefaultValues(),
  });
  const [openMaxTokens, setOpenMaxTokens] = useState(false);
  const models = useAppSelector(selectModels);
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'prompts',
  });

  return (
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
      <Controller
        control={control}
        name="model"
        rules={{ required: true }}
        render={({ field, fieldState }) => (
          <TextField
            error={!!fieldState?.error?.message}
            helperText={fieldState?.error?.message}
            select
            label="Model"
            required
            fullWidth
            sx={{ mt: 2 }}
            {...field}
          >
            {models.map((model) => (
              <MenuItem key={model} value={model}>
                {model}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
      <NumberField
        error={!!errors.temperature?.message}
        helperText={errors.temperature?.message}
        required
        label="Temperature"
        {...register('temperature', { required: true, min: 0, max: 1 })}
        sx={{ mt: 2 }}
        fullWidth
        inputProps={{ min: 0, max: 1, step: 0.01 }}
      />
      <NumberField
        error={!!errors.topP?.message}
        helperText={errors.topP?.message}
        required
        label="Top P"
        {...register('topP', { required: true, min: 0, max: 1 })}
        sx={{ mt: 2 }}
        fullWidth
        inputProps={{ min: 0, max: 1, step: 0.01 }}
      />
      <NumberField
        error={!!errors.n?.message}
        helperText={errors.n?.message}
        required
        label="N"
        {...register('n', { required: true })}
        sx={{ mt: 2 }}
        fullWidth
        inputProps={{ min: 1, step: 1 }}
      />
      <NumberField
        error={!!errors.presencePenalty?.message}
        helperText={errors.presencePenalty?.message}
        required
        label="Presence Penalty"
        {...register('presencePenalty', { required: true })}
        sx={{ mt: 2 }}
        fullWidth
        inputProps={{ min: -2, max: 2, step: 0.01 }}
      />
      <NumberField
        error={!!errors.frequencyPenalty?.message}
        helperText={errors.frequencyPenalty?.message}
        required
        label="Frequency Penalty"
        {...register('frequencyPenalty', { required: true })}
        sx={{ mt: 2 }}
        fullWidth
        inputProps={{ min: -2, max: 2, step: 0.01 }}
      />
      <FormControlLabel
        control={<Checkbox checked={openMaxTokens} onChange={(_, check) => setOpenMaxTokens(check)} />}
        label="Open Max Tokens"
        sx={{ mt: 1 }}
      />
      {openMaxTokens && (
        <NumberField
          error={!!errors.maxTokens?.message}
          helperText={errors.maxTokens?.message}
          label="Frequency Penalty"
          {...register('maxTokens', { required: true })}
          sx={{ mt: 1 }}
          fullWidth
          inputProps={{ min: 1, step: 1 }}
          required
        />
      )}
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
  );
}
