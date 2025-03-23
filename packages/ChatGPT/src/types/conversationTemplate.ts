/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-28 20:41:44
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 02:41:51
 * @FilePath: /tauri/packages/ChatGPT/src/types/conversation_template.ts
 */
import { type Mode, type Role } from './common';

export interface ConversationTemplate {
  id: number;
  name: string;
  icon: string;
  description: string | null;
  mode: Mode;
  adapter: string;
  template: Record<string, unknown>;
  prompts: ConversationTemplatePrompt[];
  createdTime: string;
  updatedTime: string;
}

export interface NewConversationTemplate {
  name: string;
  icon: string;
  description?: string | null;
  mode: Mode;
  prompts: ConversationTemplatePrompt[];
  adapter: string;
  template: object;
}

export interface ConversationTemplatePrompt {
  prompt: string;
  role: Role;
}
