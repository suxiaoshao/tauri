import { Box, Select, TextField, FormControl, InputLabel, MenuItem, Button, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { Paper } from '@mui/material';
import { invoke } from '@tauri-apps/api';

export enum Mode {
  Contextual = 'contextual',
  Single = 'single',
}
export interface NewConversation {
  title: string;
  mode: Mode;
  info?: string | null;
  prompt?: string | null;
}

export default function AddConversation() {
  const { register, handleSubmit } = useForm<NewConversation>();
  const onSubmit = handleSubmit(({ mode, title, info, prompt }) => {
    invoke('plugin:chat|save_conversation', {
      data: { mode, title, info: info?.trim() || null, prompt: prompt?.trim() || null },
    });
  });
  return (
    <Box
      component={Paper}
      sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}
      square
    >
      <Typography variant="h6">Add Conversation</Typography>
      <Box component="form" onSubmit={onSubmit}>
        <TextField {...register('title', { required: true })} required label="Title" fullWidth sx={{ mt: 1 }} />
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="mode-select-label">Mode</InputLabel>
          <Select labelId="mode-select-label" label="Mode" {...register('mode', { required: true })} required>
            <MenuItem value={Mode.Contextual}>{Mode.Contextual}</MenuItem>
            <MenuItem value={Mode.Single}>{Mode.Single}</MenuItem>
          </Select>
        </FormControl>
        <TextField {...register('info')} label="Info" fullWidth sx={{ mt: 2 }} />
        <TextField {...register('prompt')} label="Prompt" fullWidth sx={{ mt: 2 }} multiline maxRows={4} />
        <Box sx={{ mt: 2, width: '100%', display: 'flex', flexDirection: 'row-reverse' }}>
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            Submit
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
