import { createContext } from 'react';

export const MessageActionContext = createContext<{
  onMessageDeleted?: (id: number) => void;
  onMessageViewed?: (id: number) => void;
}>({});
