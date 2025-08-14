import { type ChatData } from '@chatgpt/types/chatData';
import { type ConversationTemplate } from '@chatgpt/types/conversationTemplate';
import { type Message } from '@chatgpt/types/message';
import { appInvoke } from '../base';
import { type Conversation } from '@chatgpt/types/conversation';

export interface FetchMessageParams {
  id: number;
  content: string;
  extensionName: string | null;
}

export async function fetchMessage(params: FetchMessageParams) {
  await appInvoke<FetchMessageParams, unknown>('plugin:chat|fetch', params);
}

export async function getChatData(): Promise<ChatData> {
  return await appInvoke<unknown, ChatData>('plugin:chat|get_chat_data', null);
}
export interface FindMessageParams {
  id: number;
}

export async function findMessage(params: FindMessageParams) {
  return await appInvoke<FindMessageParams, Message>('plugin:chat|find_message', params);
}
export async function allConversationTemplates(): Promise<ConversationTemplate[]> {
  return await appInvoke<unknown, ConversationTemplate[]>('plugin:chat|all_conversation_templates', null);
}

export interface FindConversationTemplateParams {
  id: number;
}

export async function findConversationTemplate(params: FindConversationTemplateParams) {
  return await appInvoke<FindConversationTemplateParams, ConversationTemplate>(
    'plugin:chat|find_conversation_template',
    params,
  );
}

export interface SearchConversationParams {
  query: string;
}

export async function searchConversation(params: SearchConversationParams) {
  return await appInvoke<SearchConversationParams, Conversation[]>('plugin:chat|search_conversation', params);
}
