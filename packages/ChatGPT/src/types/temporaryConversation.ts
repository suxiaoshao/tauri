import { type Role, type Status } from './common';
import { type ConversationTemplate } from './conversationTemplate';
import type { Content } from './message';

export interface TemporaryMessage {
  id: number;
  role: Role;
  content: Content;
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

export interface SaveTemporaryConversation {
  title: string;
  folderId: number | null;
  icon: string;
  info: string | null;
  persistentId?: number | null;
}
