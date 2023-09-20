import CustomMarkdown from '@chatgpt/components/Markdown';
import { Message } from '@chatgpt/types/message';
import { Avatar, Box, Divider } from '@mui/material';
import { MarkdownSx } from './const';
import DeleteMessageIcon from './components/DeleteMessageIcon';
import ToolBar from './components/ToolBar';

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
        <CustomMarkdown sx={{ ...MarkdownSx }} value={message.content} />
        <ToolBar>
          <DeleteMessageIcon id={message.id} />
        </ToolBar>
      </Box>
      <Divider />
    </>
  );
}
