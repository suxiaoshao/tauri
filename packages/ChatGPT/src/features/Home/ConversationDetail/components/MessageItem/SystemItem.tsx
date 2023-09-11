import CustomMarkdown from '@chatgpt/components/Markdown';
import { Message } from '@chatgpt/types/message';
import { Avatar, Box, Divider } from '@mui/material';

export interface SystemItemProps {
  message: Message;
}

export default function SystemItem({ message }: SystemItemProps) {
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
        <Avatar sx={{ ml: 2, mt: 2, backgroundColor: 'transparent' }}>🤖</Avatar>
        <CustomMarkdown
          sx={{ m: 2, mt: 3.5, flex: '1 1 0', width: (theme) => `calc(100% - ${theme.spacing(9)})` }}
          value={message.content}
        />
      </Box>
      <Divider />
    </>
  );
}
