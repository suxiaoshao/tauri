import { Send } from '@mui/icons-material';
import { Paper, InputBase, IconButton } from '@mui/material';
import { invoke } from '@tauri-apps/api';
import { useForm } from 'react-hook-form';
import { Dispatch } from 'react';
import { Role } from '@chatgpt/types/common';
import { Message } from '@chatgpt/types/message';
import { FetchingMessageAction, FetchingMessageType } from '..';

export interface ChatFormProps {
  fetchingMessageDispatch: Dispatch<FetchingMessageAction>;
  fetchingMessage: FetchingMessageType;
  conversationId: number;
}

export default function ChatForm({ fetchingMessageDispatch, fetchingMessage, conversationId }: ChatFormProps) {
  const { register, handleSubmit, setValue } = useForm<Message>({ defaultValues: { role: Role.user } });
  const onSubmit = handleSubmit(async (data) => {
    fetchingMessageDispatch(FetchingMessageAction.start);
    setValue('content', '');

    await invoke<Message>('plugin:chat|fetch', {
      content: data.content,
      id: conversationId,
    });
    fetchingMessageDispatch(FetchingMessageAction.complete);
  });
  const isLoading = [FetchingMessageType.loading].includes(fetchingMessage);
  return (
    <Paper
      onSubmit={onSubmit}
      component="form"
      sx={{
        p: '2px 4px',
        display: 'flex',
        alignItems: 'flex-end',
        width: (theme) => `calc(100% - ${theme.spacing(4)})`,
        flex: '0 0 auto',
        borderRadius: 2,
        m: 2,
        mt: 0,
        backgroundColor: 'transparent',
      }}
      elevation={3}
    >
      <InputBase
        sx={{ ml: 1, flex: 1, marginBottom: '4px' }}
        placeholder="Send a message"
        multiline
        maxRows={4}
        {...register('content')}
      />

      <IconButton type="submit" color="primary" sx={{ p: '10px' }} disabled={isLoading}>
        <Send />
      </IconButton>
    </Paper>
  );
}
