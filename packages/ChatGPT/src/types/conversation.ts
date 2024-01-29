/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-01-29 20:44:51
 * @FilePath: /tauri/packages/ChatGPT/src/types/conversation.ts
 */
import { Message } from '@chatgpt/types/message';
import { Mode } from '@chatgpt/types/common';

export interface Conversation {
  id: number;
  folderId: number | undefined;
  title: string;
  icon: string;
  mode: Mode;
  model: string;
  createdTime: string;
  updatedTime: string;
  temperature: number;
  topP: number;
  n: number;
  maxTokens?: number | undefined;
  presencePenalty: number;
  frequencyPenalty: number;
  info?: string | undefined;
  prompt?: string | undefined;
  messages: Message[];
}

export interface NewConversation {
  title: string;
  folderId: number | undefined;
  icon: string;
  mode: Mode;
  model: string;
  temperature: number;
  topP: number;
  n: number;
  maxTokens?: number | undefined;
  presencePenalty: number;
  frequencyPenalty: number;
  info?: string | undefined;
  prompt?: string | undefined;
}
