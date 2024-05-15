import { Status } from '@chatgpt/types/common';
import { useMemo } from 'react';
import NormalItem from './NormalItem';
import LoadingItem from './LoadingItem';
import HiddenItem from './HiddenItem';
import ErrorItem from './ErrorItem';
import { BaseMessage } from '../..';

export interface AssistantItemProps {
  message: BaseMessage;
}

export default function AssistantItem({ message }: AssistantItemProps) {
  return useMemo(() => {
    switch (message.status) {
      case Status.Normal:
        return <NormalItem message={message} />;
      case Status.Loading:
        return <LoadingItem message={message} />;
      case Status.Hidden:
        return <HiddenItem message={message} />;
      case Status.Error:
        return <ErrorItem message={message} />;
    }
  }, [message]);
}
