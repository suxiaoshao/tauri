import { Role } from '@chatgpt/types/common';
import { Message } from '@chatgpt/types/message';
import { useMemo } from 'react';
import UserItem from './components/UserItem';
import AssistantItem from './components/AssistantItem';
import SystemItem from './components/SystemItem';

export interface MessageItemProps {
  message: Message;
}

export default function MessageItem({ message }: MessageItemProps) {
  return useMemo(() => {
    switch (message.role) {
      case Role.user:
        return <UserItem message={message} />;
      case Role.assistant:
        return <AssistantItem message={message} />;
      case Role.system:
        return <SystemItem message={message} />;
    }
  }, [message]);
}
