import { Role, Status } from './common';

export interface TemporaryMessage {
  id: number;
  role: Role;
  content: string;
  status: Status;
  createdTime: string;
  updatedTime: string;
  startTime: string;
  endTime: string;
}
