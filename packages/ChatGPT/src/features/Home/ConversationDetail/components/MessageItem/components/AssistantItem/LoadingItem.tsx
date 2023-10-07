import { Avatar, Box, CircularProgress, Divider } from '@mui/material';
import assistant from '@chatgpt/assets/assistant.jpg';
import CustomMarkdown from '@chatgpt/components/Markdown';
import { Message } from '@chatgpt/types/message';
import { MarkdownSx, MessageSx } from '../../const';

export interface LoadingItemProps {
  message: Message;
}

export default function LoadingItem({ message }: LoadingItemProps) {
  return (
    <>
      <Box sx={MessageSx}>
        <Avatar sx={{ ml: 2, mt: 2 }} src={assistant} />
        <CustomMarkdown sx={{ ...MarkdownSx }} value={message.content} />
        <CircularProgress size={20} sx={{ mr: 2, mt: 3 }} color="inherit" />
      </Box>
      <Divider />
    </>
  );
}
