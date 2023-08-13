import { Mode, Model } from '@chatgpt/types/common';
import { NewConversation } from '@chatgpt/types/conversation';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, TextField, MenuItem, FormControlLabel, Checkbox, BoxProps } from '@mui/material';
import emojiRegex from 'emoji-regex';
import { useState } from 'react';
import { useForm, Resolver, Controller } from 'react-hook-form';
import { object, string, number } from 'yup';

const conversationSchema = object<NewConversation>().shape({
  title: string().required(),
  icon: string().matches(emojiRegex(), 'Icon should is emoji').nullable(),
  mode: string().oneOf([Mode.AssistantOnly, Mode.Contextual, Mode.Single]).required(),
  model: string().required(),
  temperature: number().min(0).max(1).required(),
  topP: number().min(0).max(1).required(),
  n: number().min(1).integer().required(),
  maxTokens: number().min(1).integer().nullable(),
  presencePenalty: number().min(-2).max(2).required(),
  frequencyPenalty: number().min(-2).max(2).required(),
  info: string().nullable(),
  prompt: string().nullable(),
});

const DefaultValues: Partial<NewConversation> = {
  mode: Mode.Contextual,
  model: Model.Gpt35_0613,
  temperature: 1,
  topP: 1,
  n: 1,
  presencePenalty: 0,
  frequencyPenalty: 0,
};

export interface ConversationEditProps extends Omit<BoxProps, 'component' | 'id' | 'onSubmit'> {
  initialValues?: NewConversation;
  id: string;
  onSubmit: (newConversation: NewConversation) => Promise<void>;
}
export default function ConversationEdit({ initialValues, id, sx, onSubmit: submit, ...props }: ConversationEditProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<NewConversation>({
    resolver: yupResolver(conversationSchema) as Resolver<NewConversation, unknown>,
    defaultValues: initialValues ?? DefaultValues,
  });
  const onSubmit = handleSubmit(submit);
  const [openMaxTokens, setOpenMaxTokens] = useState(false);
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
            <MenuItem value={Model.Gpt35}>{Model.Gpt35}</MenuItem>
            <MenuItem value={Model.Gpt35_0301}>{Model.Gpt35_0301}</MenuItem>
            <MenuItem value={Model.Gpt35_0613}>{Model.Gpt35_0613}</MenuItem>
            <MenuItem value={Model.Gpt35_16k}>{Model.Gpt35_16k}</MenuItem>
            <MenuItem value={Model.Gpt35_16k0613}>{Model.Gpt35_16k0613}</MenuItem>
          </TextField>
        )}
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
        error={!!errors.info?.message}
        helperText={errors.info?.message}
        {...register('info')}
        label="Info"
        fullWidth
        sx={{ mt: 2 }}
      />
      <TextField
        error={!!errors.prompt?.message}
        helperText={errors.prompt?.message}
        {...register('prompt')}
        label="Prompt"
        fullWidth
        sx={{ mt: 2 }}
        multiline
        maxRows={4}
      />
      <TextField
        error={!!errors.temperature?.message}
        helperText={errors.temperature?.message}
        required
        label="Temperature"
        type="number"
        {...register('temperature', { required: true, min: 0, max: 1 })}
        sx={{ mt: 2 }}
        fullWidth
        inputProps={{ min: 0, max: 1, step: 0.01 }}
      />
      <TextField
        error={!!errors.topP?.message}
        helperText={errors.topP?.message}
        required
        label="Top P"
        type="number"
        {...register('topP', { required: true, min: 0, max: 1 })}
        sx={{ mt: 2 }}
        fullWidth
        inputProps={{ min: 0, max: 1, step: 0.01 }}
      />
      <TextField
        error={!!errors.n?.message}
        helperText={errors.n?.message}
        required
        label="N"
        type="number"
        {...register('n', { required: true })}
        sx={{ mt: 2 }}
        fullWidth
        inputProps={{ min: 1, step: 1 }}
      />
      <TextField
        error={!!errors.presencePenalty?.message}
        helperText={errors.presencePenalty?.message}
        required
        label="Presence Penalty"
        type="number"
        {...register('presencePenalty', { required: true })}
        sx={{ mt: 2 }}
        fullWidth
        inputProps={{ min: -2, max: 2, step: 0.01 }}
      />
      <TextField
        error={!!errors.frequencyPenalty?.message}
        helperText={errors.frequencyPenalty?.message}
        required
        label="Frequency Penalty"
        type="number"
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
        <TextField
          error={!!errors.maxTokens?.message}
          helperText={errors.maxTokens?.message}
          label="Frequency Penalty"
          type="number"
          {...register('maxTokens', { required: true })}
          sx={{ mt: 1 }}
          fullWidth
          inputProps={{ min: 1, step: 1 }}
          required
        />
      )}
    </Box>
  );
}
