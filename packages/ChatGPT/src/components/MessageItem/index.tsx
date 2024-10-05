import { Role } from '@chatgpt/types/common';
import { useMemo } from 'react';
import { match } from 'ts-pattern';
import AssistantItem from './components/AssistantItem';
import SystemItem from './components/SystemItem';
import UserItem from './components/UserItem';
import { type BaseMessage } from './types';

export interface MessageItemProps {
  message: BaseMessage;
  selected: boolean;
}

export default function MessageItem({ message, selected }: MessageItemProps) {
  return useMemo(() => {
    return match(message.role)
      .with(Role.user, () => <UserItem selected={selected} message={message} />)
      .with(Role.assistant, () => <AssistantItem selected={selected} message={message} />)
      .with(Role.system, () => <SystemItem selected={selected} message={message} />)
      .exhaustive();
  }, [message, selected]);
}
