import { useAppSelector } from '@chatgpt/app/hooks';
import store from '@chatgpt/app/store';
import { selectModels } from '@chatgpt/features/Setting/configSlice';
import { Mode } from '@chatgpt/types/common';
import { NewConversation } from '@chatgpt/types/conversation';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { Box, TextField, MenuItem, FormControlLabel, Checkbox, BoxProps } from '@mui/material';
import { useState } from 'react';
import { useForm, Controller, Resolver } from 'react-hook-form';
import { object, string, number, Input, emoji, enum_, minValue, maxValue, integer, nullable } from 'valibot';
import NumberField from '../NumberField';

const conversationSchema = object({
  title: string(),
  icon: string([emoji()]),
  // mode: enum_(Mode),
  // model: string(),
  // temperature: number([minValue(0), maxValue(1)]),
  // topP: number([minValue(0), maxValue(1)]),
  // n: number([minValue(1), integer()]),
  // maxTokens: nullable(number([minValue(1), integer()])),
  // presencePenalty: number([minValue(-2), maxValue(2)]),
  // frequencyPenalty: number([minValue(-2), maxValue(2)]),
  info: nullable(string()),
  templateId: number([integer()]),
});

export type ConversationForm = Input<typeof conversationSchema>;

const getDefaultValues = (): Partial<NewConversation> => ({});

export interface ConversationEditProps extends Omit<BoxProps, 'component' | 'id' | 'onSubmit'> {
  initialValues?: NewConversation;
  id: string;
  onSubmit: (newConversation: ConversationForm) => Promise<void>;
}
export default function ConversationEdit({ initialValues, id, sx, onSubmit: submit, ...props }: ConversationEditProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<ConversationForm>({
    resolver: valibotResolver(conversationSchema) as Resolver<ConversationForm, unknown>,
    defaultValues: initialValues ?? getDefaultValues(),
  });
  const onSubmit = handleSubmit(submit);
  const [openMaxTokens, setOpenMaxTokens] = useState(false);
  const models = useAppSelector(selectModels);
  return (
    <Box
      {...props}
      sx={{
        flex: '1 1 0',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflowY: 'auto',
        p: 2,
        ...sx,
      }}
      component="form"
      id={id}
      onSubmit={onSubmit}
    >
      <TextField
        error={!!errors.title?.message}
        helperText={errors.title?.message}
        {...register('title', { required: true })}
        required
        label="Title"
        fullWidth
      />
      {/* todo:conversation template migration */}
      {/* <Controller
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
      /> */}

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
        error={!!errors.info?.message}
        helperText={errors.info?.message}
        {...register('info')}
        label="Info"
        fullWidth
        sx={{ mt: 2 }}
      />
      {/* <TextField
        error={!!errors.prompt?.message}
        helperText={errors.prompt?.message}
        {...register('prompt')}
        label="Prompt"
        fullWidth
        sx={{ mt: 2 }}
        multiline
        maxRows={4}
      />
      <NumberField
        error={!!errors.temperature?.message}
        helperText={errors.temperature?.message}
        required
        label="Temperature"
        {...register('temperature', { required: true, min: 0, max: 1 })}
        sx={{ mt: 2 }}
        fullWidth
        inputProps={{ min: 0, max: 1, step: 0.01, inputmode: 'numeric', pattern: '[0-9]*' }}
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
      )} */}
    </Box>
  );
}
