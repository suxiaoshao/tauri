import { Status } from '@chatgpt/types/common';
import { useMemo } from 'react';
import { match } from 'ts-pattern';
import { type BaseMessage } from '../../types';
import ErrorItem from './ErrorItem';
import HiddenItem from './HiddenItem';
import LoadingItem from './LoadingItem';
import NormalItem from './NormalItem';

export interface AssistantItemProps {
  message: BaseMessage;
}

export default function AssistantItem({ message }: AssistantItemProps) {
  return useMemo(() => {
    return match(message.status)
      .with(Status.Normal, () => <NormalItem message={message} />)
      .with(Status.Loading, () => <LoadingItem message={message} />)
      .with(Status.Hidden, () => <HiddenItem message={message} />)
      .with(Status.Error, () => <ErrorItem message={message} />)
      .exhaustive();
  }, [message]);
}
