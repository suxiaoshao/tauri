import { NewConversation } from '@chatgpt/types/conversation';
import { appInvoke } from './base';
import { NewFolder } from '@chatgpt/types/folder';
import { ChatData } from '@chatgpt/types/chatData';
import { Message } from '@chatgpt/types/message';

export interface AddConversationParams {
  data: NewConversation;
}

export async function addConversation(params: AddConversationParams) {
  await appInvoke<AddConversationParams, unknown>('plugin:chat|add_conversation', params);
}

export interface AddFolderParams {
  folder: NewFolder;
}

export async function addFolder(params: AddFolderParams) {
  await appInvoke<AddFolderParams, unknown>('plugin:chat|add_folder', params);
}

export interface UpdateConversationParams {
  data: NewConversation;
  id: number;
}

export async function updateConversation(params: UpdateConversationParams) {
  await appInvoke<UpdateConversationParams, unknown>('plugin:chat|update_conversation', params);
}

export interface DeleteConversationParams {
  id: number;
}

export async function deleteConversation(params: DeleteConversationParams) {
  await appInvoke<DeleteConversationParams, unknown>('plugin:chat|delete_conversation', params);
}

export interface DeleteFolderParams {
  id: number;
}

export async function deleteFolder(params: DeleteFolderParams) {
  await appInvoke<DeleteFolderParams, unknown>('plugin:chat|delete_folder', params);
}

export interface UpdateFolderParams {
  folder: NewFolder;
  id: number;
}

export async function updateFolder(params: UpdateFolderParams) {
  await appInvoke<UpdateFolderParams, unknown>('plugin:chat|update_folder', params);
}

export interface FetchMessageParams {
  id: number;
  content: string;
}

export async function fetchMessage(params: FetchMessageParams) {
  await appInvoke<FetchMessageParams, unknown>('plugin:chat|fetch', params);
}

export async function getChatData(): Promise<ChatData> {
  return await appInvoke<unknown, ChatData>('plugin:chat|get_chat_data', undefined);
}

export interface MoveConversationParams {
  conversationId: number;
  folderId: number | null;
}

export async function moveConversation(params: MoveConversationParams) {
  await appInvoke<MoveConversationParams, unknown>('plugin:chat|move_conversation', params);
}

export interface MoveFolderParams {
  id: number;
  parentId: number | null;
}

export async function moveFolder(params: MoveFolderParams) {
  await appInvoke<MoveFolderParams, unknown>('plugin:chat|move_folder', params);
}

export interface DeleteMessageParams {
  id: number;
}

export async function deleteMessage(params: DeleteMessageParams) {
  await appInvoke<DeleteMessageParams, unknown>('plugin:chat|delete_message', params);
}

export interface FindMessageParams {
  id: number;
}

export async function findMessage(params: FindMessageParams) {
  return await appInvoke<FindMessageParams, Message>('plugin:chat|find_message', params);
}

export interface UpdateMessageContentParams {
  id: number;
  content: string;
}

export async function updateMessageContent(params: UpdateMessageContentParams) {
  await appInvoke<UpdateMessageContentParams, unknown>('plugin:chat|update_message_content', params);
}

export interface ClearConversationParams {
  id: number;
}

export async function clearConversation(params: ClearConversationParams) {
  await appInvoke<ClearConversationParams, unknown>('plugin:chat|clear_conversation', params);
}
