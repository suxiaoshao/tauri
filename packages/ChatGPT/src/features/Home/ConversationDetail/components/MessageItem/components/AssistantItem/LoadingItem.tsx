import { Avatar, Box, CircularProgress, Divider } from '@mui/material';
import assistant from '@chatgpt/assets/assistant.jpg';
import CustomMarkdown from '@chatgpt/components/Markdown';
import { Message } from '@chatgpt/types/message';
import { MarkdownSx, ToolSx } from '../../const';
import ToolBar from '../ToolBar';

export interface LoadingItemProps {
  message: Message;
}

export default function LoadingItem({ message }: LoadingItemProps) {
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
        <CustomMarkdown sx={{ ...MarkdownSx }} value={message.content} />
        <ToolBar>
          <CircularProgress size={20} sx={ToolSx} color="inherit" />
        </ToolBar>
      </Box>
      <Divider />
    </>
  );
}
