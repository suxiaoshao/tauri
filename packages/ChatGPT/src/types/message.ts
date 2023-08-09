import { Role, Status } from '@chatgpt/types/common';

export interface Message {
  id: number;
  conversation_id: number;
  role: Role;
  content: string;
  status: Status;
  createdTime: string;
  updatedTime: string;
  startTime: string;
  endTime: string;
}
