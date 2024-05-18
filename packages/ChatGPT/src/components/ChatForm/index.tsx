import { Send } from '@mui/icons-material';
import { Paper, InputBase, IconButton } from '@mui/material';
import { useForm } from 'react-hook-form';
import { Role } from '@chatgpt/types/common';
import { Message } from '@chatgpt/types/message';
import { PromiseData, PromiseStatus } from '@chatgpt/hooks/usePromise';
import React, { useCallback, useEffect, useState } from 'react';

export interface ChatFormProps {
  status: PromiseData<void>;
  onSendMessage: (content: string) => Promise<void>;
}

export default function ChatForm({ status, onSendMessage }: ChatFormProps) {
  const { register, handleSubmit, reset } = useForm<Message>({ defaultValues: { role: Role.user } });
  const onSubmit = handleSubmit(async (data) => {
    reset();
    await onSendMessage(data.content);
  });
  const isLoading = [PromiseStatus.loading].includes(status.tag);
  // search & fucused
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
  useEffect(() => {
    if (inputRef) {
      inputRef.focus();
    }
  }, [inputRef]);

  // shift + enter
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' && event.shiftKey) {
        event.preventDefault();
        onSubmit();
      }
    },
    [onSubmit],
  );
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
        inputRef={setInputRef}
        onKeyDown={handleKeyDown}
        {...register('content')}
      />

      <IconButton type="submit" color="primary" sx={{ p: '10px' }} disabled={isLoading}>
        <Send />
      </IconButton>
    </Paper>
  );
}
