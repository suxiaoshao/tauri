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
  selected: boolean;
}

export default function AssistantItem({ message, selected }: AssistantItemProps) {
  return useMemo(() => {
    return match(message.status)
      .with(Status.Normal, () => <NormalItem selected={selected} message={message} />)
      .with(Status.Loading, () => <LoadingItem selected={selected} message={message} />)
      .with(Status.Hidden, () => <HiddenItem selected={selected} message={message} />)
      .with(Status.Error, () => <ErrorItem selected={selected} message={message} />)
      .exhaustive();
  }, [message, selected]);
}
