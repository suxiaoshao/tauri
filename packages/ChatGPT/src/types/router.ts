import { type Selected } from '@chatgpt/features/Conversations/types';
import { type Enum } from 'types';

export interface RouterEvent {
  path: string;
  conversationSelected?: Selected | null;
  isUpdate: boolean;
}

export type ConversationSelected = Enum<'Forder', number> | Enum<'Conversation', number>;
