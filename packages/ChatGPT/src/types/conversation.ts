import { Message } from '@chatgpt/types/message';
import { Mode, Model } from '@chatgpt/types/common';

export interface Conversation {
  id: number;
  folderId: number | null;
  title: string;
  icon: string;
  mode: Mode;
  model: Model;
  createdTime: string;
  updatedTime: string;
  temperature: number;
  topP: number;
  n: number;
  maxTokens?: number | null;
  presencePenalty: number;
  frequencyPenalty: number;
  info?: string | null;
  prompt?: string | null;
  messages: Message[];
}

export interface NewConversation {
  title: string;
  folderId: number | null;
  icon: string;
  mode: Mode;
  model: Model;
  temperature: number;
  topP: number;
  n: number;
  maxTokens?: number | null | undefined;
  presencePenalty: number;
  frequencyPenalty: number;
  info?: string | null | undefined;
  prompt?: string | null | undefined;
}
