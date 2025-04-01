import { type Role, type Status } from '@chatgpt/types/common';
import type { Enum } from 'types';

export interface Message {
  id: number;
  conversationId: number;
  role: Role;
  content: Content;
  status: Status;
  createdTime: string;
  updatedTime: string;
  startTime: string;
  endTime: string;
}

export type Content =
  | Enum<'text', string>
  | Enum<
      'extension',
      {
        source: string;
        extensionName: string;
        content: string;
      }
    >;
