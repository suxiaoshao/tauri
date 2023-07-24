import CustomMarkdown from '@chatgpt/components/Markdown';
import { Box } from '@mui/material';
import { Enum } from 'types';

export enum FetchingMessageTypeTag {
  loading = 'loading',
  init = 'init',
  error = 'error',
  complete = 'complete',
  start = 'start',
}

export type FetchingMessageType =
  | Enum<FetchingMessageTypeTag.loading, string>
  | Enum<FetchingMessageTypeTag.init>
  | Enum<FetchingMessageTypeTag.error, Error>
  | Enum<FetchingMessageTypeTag.complete, string>
  | Enum<FetchingMessageTypeTag.start>;

export interface FetchingMessageProps {
  fetchingMessage: FetchingMessageType;
}
export default function FetchingMessage({ fetchingMessage }: FetchingMessageProps) {
  switch (fetchingMessage.tag) {
    case FetchingMessageTypeTag.init:
      return <Box>Start chatting!</Box>;
    case FetchingMessageTypeTag.loading:
      return <CustomMarkdown value={fetchingMessage.value} />;
    case FetchingMessageTypeTag.error:
      return <Box>{fetchingMessage.value.message}</Box>;
    case FetchingMessageTypeTag.complete:
      return <CustomMarkdown value={fetchingMessage.value} />;
    case FetchingMessageTypeTag.start:
      return <Box>Loading...</Box>;
  }
}
