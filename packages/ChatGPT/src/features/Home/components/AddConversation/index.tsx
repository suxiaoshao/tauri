import { Box, TextField, MenuItem, Button, Typography, Checkbox, FormControlLabel } from '@mui/material';
import { Resolver, useForm } from 'react-hook-form';
import { Paper } from '@mui/material';
import { invoke } from '@tauri-apps/api';
import { useAppDispatch } from '@chatgpt/app/hooks';
import { fetchConversations } from '@chatgpt/features/Conversations/conversationSlice';
import { NewConversation } from '@chatgpt/types/conversation';
import { Mode, Model } from '@chatgpt/types/common';
import { useState } from 'react';
import { number, object, string } from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const conversationSchema = object<NewConversation>().shape({
  title: string().required(),
  mode: string().oneOf([Mode.AssistantOnly, Mode.Contextual, Mode.Single]).required(),
  model: string().required(),
  temperature: number().min(0).max(1).required(),
  topP: number().min(0).max(1).required(),
  n: number().min(1).required(),
  maxTokens: number().min(1).nullable(),
  presencePenalty: number().min(-2).max(2).required(),
  frequencyPenalty: number().min(-2).max(2).required(),
  info: string(),
  prompt: string(),
});

export default function AddConversation() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewConversation>({
    resolver: yupResolver(conversationSchema) as Resolver<NewConversation, unknown>,
    defaultValues: {
      mode: Mode.Contextual,
      model: Model.Gpt35_0613,
      temperature: 1,
      topP: 1,
      n: 1,
      presencePenalty: 0,
      frequencyPenalty: 0,
    },
  });
  const dispatch = useAppDispatch();
  const onSubmit = handleSubmit(async ({ info, prompt, ...data }) => {
    await invoke('plugin:chat|save_conversation', {
      data: { info: info?.trim() || null, prompt: prompt?.trim() || null, ...data },
    });
    dispatch(fetchConversations());
  });
  const [openMaxTokens, setOpenMaxTokens] = useState(false);
  return (
    <Box
      component={Paper}
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
      square
    >
      <Typography variant="h6" sx={{ ml: 2, mt: 2, mr: 2 }}>
        Add Conversation
      </Typography>
      <Box
        sx={{ flex: '1 1 0', display: 'flex', flexDirection: 'column', position: 'relative' }}
        component="form"
        onSubmit={onSubmit}
      >
        <Box sx={{ overflowY: 'auto', flex: '1 1 0', p: 2, mb: 6.5 }}>
          <TextField
            error={!!errors.title?.message}
            helperText={errors.title?.message}
            {...register('title', { required: true })}
            required
            label="Title"
            fullWidth
            sx={{ mt: 2 }}
          />
          <TextField
            error={!!errors.mode?.message}
            helperText={errors.mode?.message}
            select
            label="Mode"
            {...register('mode', { required: true })}
            required
            fullWidth
            sx={{ mt: 2 }}
          >
            <MenuItem value={Mode.Contextual}>{Mode.Contextual}</MenuItem>
            <MenuItem value={Mode.Single}>{Mode.Single}</MenuItem>
            <MenuItem value={Mode.AssistantOnly}>{Mode.AssistantOnly}</MenuItem>
          </TextField>
          <TextField
            error={!!errors.model?.message}
            helperText={errors.model?.message}
            select
            label="Model"
            {...register('model', { required: true })}
            required
            fullWidth
            sx={{ mt: 2 }}
          >
            <MenuItem value={Model.Gpt35}>{Model.Gpt35}</MenuItem>
            <MenuItem value={Model.Gpt35_0301}>{Model.Gpt35_0301}</MenuItem>
            <MenuItem value={Model.Gpt35_0613}>{Model.Gpt35_0613}</MenuItem>
            <MenuItem value={Model.Gpt35_16k}>{Model.Gpt35_16k}</MenuItem>
            <MenuItem value={Model.Gpt35_16k0613}>{Model.Gpt35_16k0613}</MenuItem>
          </TextField>
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

        <Button
          type="submit"
          variant="contained"
          sx={{
            position: 'absolute',
            right: (theme) => theme.spacing(2),
            bottom: (theme) => theme.spacing(2),
          }}
        >
          Submit
        </Button>
      </Box>
    </Box>
  );
}
