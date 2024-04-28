import { Mode, Role } from './common';

export interface ConversationTemplate {
  id: number;
  name: string;
  icon: string;
  mode: Mode;
  model: string;
  createdTime: string;
  updatedTime: string;
  temperature: number;
  topP: number;
  n: number;
  maxTokens?: number;
  presencePenalty: number;
  frequencyPenalty: number;
  prompts: ConversationTemplatePrompt[];
}

export interface ConversationTemplatePrompt {
  id: number;
  templateId: number;
  prompt: string;
  role: Role;
  createdTime: string;
  updatedTime: string;
}
