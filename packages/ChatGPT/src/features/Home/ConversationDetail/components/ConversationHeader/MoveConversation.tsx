import { Conversation } from '@chatgpt/types/conversation';
import { IconButton, Tooltip } from '@mui/material';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';

export interface MoveConversationProps {
  conversation: Conversation;
}

export default function MoveConversation({}: MoveConversationProps) {
  return (
    <>
      <Tooltip title="Move">
        <IconButton>
          <DriveFileMoveIcon />
        </IconButton>
      </Tooltip>
    </>
  );
}
