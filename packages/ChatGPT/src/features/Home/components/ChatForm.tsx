import { Send } from '@mui/icons-material';
import { Paper, InputBase, Divider, Button, IconButton } from '@mui/material';
import { invoke } from '@tauri-apps/api';
import { listen } from '@tauri-apps/api/event';
import { Controller, useForm } from 'react-hook-form';
import CustomSelector from '../../../components/CustomSelector';
import { ChatResponse, Message } from '../types';
import { Dispatch } from 'react';
import { FetchingMessageAction, FetchingMessageActionTag } from '..';
import { FetchingMessageType, FetchingMessageTypeTag } from './FetchingMessage';
import { useAppSelector } from '@chatgpt/app/hooks';
import { selectSelectedConversation } from '@chatgpt/features/Conversations/conversationSlice';
import { Role } from '@chatgpt/types/common';

export interface ChatFormProps {
  fetchingMessageDispatch: Dispatch<FetchingMessageAction>;
  fetchingMessage: FetchingMessageType;
}

export default function ChatForm({ fetchingMessageDispatch, fetchingMessage }: ChatFormProps) {
  const { register, handleSubmit, control, setValue } = useForm<Message>({ defaultValues: { role: Role.user } });
  const id = useAppSelector(selectSelectedConversation)?.id;
  const onSubmit = handleSubmit(async (data) => {
    fetchingMessageDispatch({ tag: FetchingMessageActionTag.start });
    setValue('content', '');
    const unListen = await listen<ChatResponse>('fetch', (response) => {
      response.payload.choices.forEach((choice) => {
        fetchingMessageDispatch({ tag: FetchingMessageActionTag.add, value: choice.delta.content ?? '' });
      });
    });

    const result = await invoke('plugin:chat|fetch', {
      content: data.content,
      id: id,
    });
    console.log(result);
    fetchingMessageDispatch({ tag: FetchingMessageActionTag.complete });
    unListen();
  });
  const isLoading = [FetchingMessageTypeTag.loading, FetchingMessageActionTag.start].includes(fetchingMessage.tag);
  return (
    <Paper
      onSubmit={onSubmit}
      component="form"
      sx={{ p: '2px 4px', display: 'flex', alignItems: 'flex-end', width: '100%', flex: '0 0 auto', borderRadius: 2 }}
      elevation={3}
    >
      <InputBase
        sx={{ ml: 1, flex: 1, marginBottom: '4px' }}
        placeholder="Send a message"
        multiline
        maxRows={4}
        {...register('content')}
      />
      <Divider sx={{ height: (theme) => `calc(100% - ${theme.spacing(1)})`, m: 0.5 }} orientation="vertical" />
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

      <IconButton type="submit" color="primary" sx={{ p: '10px' }} disabled={isLoading}>
        <Send />
      </IconButton>
    </Paper>
  );
}
