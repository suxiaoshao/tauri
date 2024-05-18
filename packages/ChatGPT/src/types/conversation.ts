/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-28 20:44:52
 * @FilePath: /tauri/packages/ChatGPT/src/types/conversation.ts
 */
import { Message } from '@chatgpt/types/message';

export interface Conversation {
  id: number;
  folderId: number | undefined;
  title: string;
  icon: string;
  createdTime: string;
  updatedTime: string;
  info?: string | undefined;
  messages: Message[];
  templateId: number;
}

export interface NewConversation {
  title: string;
  folderId: number | undefined;
  icon: string;
  info?: string | null;
  templateId: number;
}
