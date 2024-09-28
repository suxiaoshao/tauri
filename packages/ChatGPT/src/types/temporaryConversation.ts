import { type Role, type Status } from './common';
import { type ConversationTemplate } from './conversationTemplate';

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

export interface TemporaryConversation {
  template: ConversationTemplate;
  messages: TemporaryMessage[];
  autoincrementId: number;
  persistentId?: number | null;
}

export interface TemporaryMessageEvent {
  persistentId?: number | null;
  message: TemporaryMessage;
}
