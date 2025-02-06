import { type Enum } from 'types';

export interface RouterEvent {
  path: string;
  isUpdate: boolean;
}

export type ConversationSelected = Enum<'Forder', number> | Enum<'Conversation', number>;
