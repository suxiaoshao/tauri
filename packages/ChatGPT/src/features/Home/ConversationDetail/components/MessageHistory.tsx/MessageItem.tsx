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
      return <CircularProgress size={20} sx={{ mr: 2, mt: 1 }} color="inherit" />;
    }
    return <CheckCircleOutlineOutlined fontSize={'small'} sx={{ mr: 2, mt: 1 }} />;
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
        <Avatar sx={{ ml: 1, mt: 1 }} src={logo} />
        <CustomMarkdown
          sx={{ m: 1, mt: 2.5, flex: '1 1 0', width: (theme) => `calc(100% - ${theme.spacing(11.5)})` }}
          value={message.content}
        />
        {loading}
      </Box>
      <Divider />
    </>
  );
}
