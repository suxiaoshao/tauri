import { type Role, type Status } from '@chatgpt/types/common';

export interface BaseMessage {
  id: number;
  role: Role;
  content: string;
  status: Status;
}
