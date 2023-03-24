import { Send } from '@mui/icons-material';
import { Box, Button, Divider, IconButton, InputBase, Paper } from '@mui/material';
import { invoke } from '@tauri-apps/api';
import { listen } from '@tauri-apps/api/event';
import { Controller, useForm } from 'react-hook-form';
import CustomSelector from '../../components/CustomSelector';

enum Model {
  TextDavinci = 'text-davinci-003',
  Gpt35 = 'gpt-3.5-turbo',
}

interface ChatRequest {
  model: Model;
  stream: boolean;
  messages: Message[];
}

interface Message {
  role: Role;
  content: string;
}
enum Role {
  system = 'system',
  user = 'user',
  assistant = 'assistant',
}

interface ChatResponse {
  id: string;
  object: string;
  created: number;
  choices: Choice[];
}

interface Choice {
  index: number;
  delta: Delta;
  finish_reason: string | null;
}

interface Delta {
  role: Role | null;
  content: string | null;
}

export default function Home() {
  const { register, handleSubmit, control } = useForm<Message>({ defaultValues: { role: Role.user } });
  const onSubmit = handleSubmit(async (data) => {
    const chatRequest: ChatRequest = {
      model: Model.Gpt35,
      stream: true,
      messages: [data],
    };
    const unListen = await listen<ChatResponse>('fetch', (response) => {
      response.payload.choices.forEach((choice) => {
        console.log(choice.delta.content);
      });
    });

    await invoke('plugin:chat|fetch', { body: chatRequest });
    unListen();
  });
  return (
    <Box
      component={Paper}
      sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}
      square
    >
      <Box sx={{ flex: '1 1 0' }} />
      <Paper
        onSubmit={onSubmit}
        component="form"
        sx={{ p: '2px 4px', display: 'flex', alignItems: 'flex-end', width: '100%', flex: '0 0 auto' }}
      >
        <InputBase
          sx={{ ml: 1, flex: 1, marginBottom: '4px' }}
          placeholder="Search Google Maps"
          multiline
          maxRows={4}
          {...register('content')}
        />
        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
        <Controller
          control={control}
          rules={{ required: true }}
          name="role"
          render={({ field }) => (
            <CustomSelector<Role>
              {...field}
              render={(onClick) => (
                <Button sx={{ marginBottom: '4px' }} onClick={onClick}>
                  {field.value}
                </Button>
              )}
            >
              {[
                { value: Role.user, label: 'user', key: 'user' },
                { value: Role.assistant, label: 'assistant', key: 'assistant' },
                { value: Role.system, label: 'system', key: 'system' },
              ]}
            </CustomSelector>
          )}
        />

        <IconButton type="submit" color="primary" sx={{ p: '10px' }}>
          <Send />
        </IconButton>
      </Paper>
    </Box>
  );
}
