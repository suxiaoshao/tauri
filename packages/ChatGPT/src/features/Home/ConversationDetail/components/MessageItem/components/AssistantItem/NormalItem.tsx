import { Avatar, Box, Divider } from '@mui/material';
import assistant from '@chatgpt/assets/assistant.jpg';
import CustomMarkdown from '@chatgpt/components/Markdown';
import { Message } from '@chatgpt/types/message';
import { CheckCircleOutlineOutlined } from '@mui/icons-material';
import { MarkdownSx, MessageSx, ToolSx } from '../../const';
import DeleteMessageIcon from '../ToolBar/DeleteMessageIcon';
import ToolBar from '../ToolBar';
import ViewIcon from '../ToolBar/ViewIcon';

export interface NormalItemProps {
  message: Message;
}

export default function NormalItem({ message }: NormalItemProps) {
  return (
    <>
      <Box sx={MessageSx}>
        <Avatar sx={{ ml: 2, mt: 2 }} src={assistant} />
        <CustomMarkdown sx={{ ...MarkdownSx }} value={message.content} />
        <ToolBar>
          <CheckCircleOutlineOutlined fontSize={'small'} sx={ToolSx} />
          <DeleteMessageIcon id={message.id} />
          <ViewIcon id={message.id} />
        </ToolBar>
      </Box>
      <Divider />
    </>
  );
}
