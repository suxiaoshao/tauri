import { Mode } from '@chatgpt/features/Home/components/AddConversation';
import { Message } from '@chatgpt/types/message';
import { Model } from '@chatgpt/types/common';

export interface Conversation {
  id: number;
  title: string;
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
