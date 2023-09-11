import { Message } from '@chatgpt/types/message';
import { Avatar, Box, CircularProgress, Divider } from '@mui/material';
import assistant from '@chatgpt/assets/assistant.jpg';
import CustomMarkdown from '@chatgpt/components/Markdown';
import { Status } from '@chatgpt/types/common';
import { useMemo } from 'react';
import { CheckCircleOutlineOutlined } from '@mui/icons-material';

export interface AssistantItemProps {
  message: Message;
}

export default function AssistantItem({ message }: AssistantItemProps) {
  const loading = useMemo(() => {
    if (message.status === Status.Loading) {
      return <CircularProgress size={20} sx={{ mr: 2, mt: 2 }} color="inherit" />;
    }
    return <CheckCircleOutlineOutlined fontSize={'small'} sx={{ mr: 2, mt: 2 }} />;
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
        <Avatar sx={{ ml: 2, mt: 2 }} src={assistant} />
        <CustomMarkdown
          sx={{ m: 2, mt: 3.5, flex: '1 1 0', width: (theme) => `calc(100% - ${theme.spacing(15.5)})` }}
          value={message.content}
        />
        {loading}
      </Box>
      <Divider />
    </>
  );
}
