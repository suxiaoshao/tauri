import { Role } from '@chatgpt/types/common';
import { useMemo } from 'react';
import { match } from 'ts-pattern';
import AssistantItem from './components/AssistantItem';
import SystemItem from './components/SystemItem';
import UserItem from './components/UserItem';
import { BaseMessage } from './types';

export interface MessageItemProps {
  message: BaseMessage;
}

export default function MessageItem({ message }: MessageItemProps) {
  return useMemo(() => {
    return match(message.role)
      .with(Role.user, () => <UserItem message={message} />)
      .with(Role.assistant, () => <AssistantItem message={message} />)
      .with(Role.system, () => <SystemItem message={message} />)
      .exhaustive();
  }, [message]);
}
