import CustomMarkdown from '@chatgpt/components/Markdown';
import { Role, Status } from '@chatgpt/types/common';
import { Message } from '@chatgpt/types/message';
import { Avatar, Box, CircularProgress, Divider } from '@mui/material';
import { useMemo } from 'react';
import assistant from '@chatgpt/assets/assistant.jpg';
import user from '@chatgpt/assets/user.jpg';
import { CheckCircleOutlineOutlined } from '@mui/icons-material';

export interface MessageItemProps {
  message: Message;
}

export default function MessageItem({ message }: MessageItemProps) {
  const logo = useMemo(() => {
    switch (message.role) {
      case Role.assistant:
        return assistant;
      case Role.user:
        return user;
    }
  }, [message.role]);
  const loading = useMemo(() => {
    if (message.status === Status.Loading) {
      return (
        <CircularProgress
          size={20}
          sx={{ position: 'absolute', right: (theme) => theme.spacing(1), top: (theme) => theme.spacing(1) }}
          color="inherit"
        />
      );
    }
    return (
      <CheckCircleOutlineOutlined
        fontSize={'small'}
        sx={{ position: 'absolute', right: (theme) => theme.spacing(1), top: (theme) => theme.spacing(1) }}
      />
    );
  }, [message.status]);
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          position: 'relative',
          minHeight: '56px',
        }}
      >
        <Avatar
          sx={{ position: 'absolute', left: (theme) => theme.spacing(1), top: (theme) => theme.spacing(1) }}
          src={logo}
        />
        <CustomMarkdown
          sx={{ p: 1, pt: 2.5, pl: 7, pr: 4.5, flex: '1 1 0', maxHeight: '300px', overflowY: 'auto' }}
          value={message.content}
        />
        {loading}
      </Box>
      <Divider />
    </>
  );
}
