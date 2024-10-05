import { createContext } from 'react';

export const MessageActionContext = createContext<{
  // eslint-disable-next-line no-unexpected-multiline
  onMessageDeleted?: (id: number) => void;
  onMessageViewed?: (id: number) => void;
}>({});
