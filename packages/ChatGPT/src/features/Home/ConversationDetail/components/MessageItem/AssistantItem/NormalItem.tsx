import { Avatar, Box, Divider } from '@mui/material';
import assistant from '@chatgpt/assets/assistant.jpg';
import CustomMarkdown from '@chatgpt/components/Markdown';
import { Message } from '@chatgpt/types/message';
import { CheckCircleOutlineOutlined } from '@mui/icons-material';
import { MarkdownSx, ToolSx } from '../const';
import DeleteMessageIcon from '../components/DeleteMessageIcon';
import ToolBar from '../components/ToolBar';

export interface NormalItemProps {
  message: Message;
}

export default function NormalItem({ message }: NormalItemProps) {
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
          <CheckCircleOutlineOutlined fontSize={'small'} sx={ToolSx} />
          <DeleteMessageIcon id={message.id} />
        </ToolBar>
      </Box>
      <Divider />
    </>
  );
}
