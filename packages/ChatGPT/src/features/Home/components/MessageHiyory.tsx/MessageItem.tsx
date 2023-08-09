import CustomMarkdown from '@chatgpt/components/Markdown';
import { Role } from '@chatgpt/types/common';
import { Message } from '@chatgpt/types/message';
import { Avatar, Divider, ListItem, ListItemAvatar } from '@mui/material';
import { useMemo } from 'react';
import assistant from '@chatgpt/assets/assistant.jpg';
import user from '@chatgpt/assets/user.jpg';

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
  return (
    <>
      <ListItem>
        <ListItemAvatar>
          <Avatar src={logo} />
        </ListItemAvatar>
        <CustomMarkdown value={message.content} />
      </ListItem>
      <Divider />
    </>
  );
}
