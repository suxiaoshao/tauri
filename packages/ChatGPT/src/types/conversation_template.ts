/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-28 20:41:44
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-30 22:00:19
 * @FilePath: /tauri/packages/ChatGPT/src/types/conversation_template.ts
 */
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

export interface NewConversationTemplate {
  name: string;
  icon: string;
  mode: Mode;
  model: string;
  temperature: number;
  topP: number;
  n: number;
  maxTokens: number | null;
  presencePenalty: number;
  frequencyPenalty: number;
  prompts: NewConversationTemplatePrompt[]; // Assuming MewConversationTemplatePrompt is defined elsewhere
}

export interface NewConversationTemplatePrompt {
  prompt: string;
  role: Role;
}
