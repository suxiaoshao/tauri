import { type Role, type Status } from '@chatgpt/types/common';
import type { Content } from '@chatgpt/types/message';

export interface BaseMessage {
  id: number;
  role: Role;
  content: Content;
  status: Status;
}
