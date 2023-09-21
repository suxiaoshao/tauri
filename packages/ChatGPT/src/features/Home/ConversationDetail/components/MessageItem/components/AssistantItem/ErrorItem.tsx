import { Avatar, Box, Divider } from '@mui/material';
import assistant from '@chatgpt/assets/assistant.jpg';
import CustomMarkdown from '@chatgpt/components/Markdown';
import { Message } from '@chatgpt/types/message';
import { MarkdownSx } from '../../const';
import DeleteMessageIcon from '../ToolBar/DeleteMessageIcon';
import ToolBar from '../ToolBar';

export interface ErrorItemProps {
  message: Message;
}

export default function ErrorItem({ message }: ErrorItemProps) {
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          position: 'relative',
          minHeight: '56px',
          borderLeft: (theme) => `${theme.spacing(1)} solid ${theme.palette.error.light}`,
          backgroundColor: (theme) => `${theme.palette.error.main}10`,
        }}
      >
        <Avatar sx={{ ml: 2, mt: 2 }} src={assistant} />
        <CustomMarkdown sx={{ ...MarkdownSx }} value={message.content} />
        <ToolBar>
          <DeleteMessageIcon id={message.id} />
        </ToolBar>
      </Box>
      <Divider />
    </>
  );
}
