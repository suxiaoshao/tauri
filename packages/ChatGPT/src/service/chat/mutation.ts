import { NewConversation } from '@chatgpt/types/conversation';
import { appInvoke } from '../base';
import { NewFolder } from '@chatgpt/types/folder';
import { NewConversationTemplate } from '@chatgpt/types/conversationTemplate';
import store from '@chatgpt/app/store';
import { fetchTemplates } from '@chatgpt/features/Template/templateSlice';
import { fetchConversations } from '@chatgpt/features/Conversations/conversationSlice';

export interface AddConversationParams {
  data: NewConversation;
}

export async function addConversation(params: AddConversationParams) {
  await appInvoke<AddConversationParams, unknown>('plugin:chat|add_conversation', params);
  store.dispatch(fetchConversations());
}

export interface AddFolderParams {
  folder: NewFolder;
}

export async function addFolder(params: AddFolderParams) {
  await appInvoke<AddFolderParams, unknown>('plugin:chat|add_folder', params);
  store.dispatch(fetchConversations());
}

export interface UpdateConversationParams {
  data: NewConversation;
  id: number;
}

export async function updateConversation(params: UpdateConversationParams) {
  await appInvoke<UpdateConversationParams, unknown>('plugin:chat|update_conversation', params);
  store.dispatch(fetchConversations());
}

export interface DeleteConversationParams {
  id: number;
}

export async function deleteConversation(params: DeleteConversationParams) {
  await appInvoke<DeleteConversationParams, unknown>('plugin:chat|delete_conversation', params);
  store.dispatch(fetchConversations());
}

export interface DeleteFolderParams {
  id: number;
}

export async function deleteFolder(params: DeleteFolderParams) {
  await appInvoke<DeleteFolderParams, unknown>('plugin:chat|delete_folder', params);
  store.dispatch(fetchConversations());
}

export interface UpdateFolderParams {
  folder: NewFolder;
  id: number;
}

export async function updateFolder(params: UpdateFolderParams) {
  await appInvoke<UpdateFolderParams, unknown>('plugin:chat|update_folder', params);
  store.dispatch(fetchConversations());
}

export interface MoveConversationParams {
  conversationId: number;
  folderId: number | null;
}

export async function moveConversation(params: MoveConversationParams) {
  await appInvoke<MoveConversationParams, unknown>('plugin:chat|move_conversation', params);
  store.dispatch(fetchConversations());
}

export interface MoveFolderParams {
  id: number;
  parentId: number | null;
}

export async function moveFolder(params: MoveFolderParams) {
  await appInvoke<MoveFolderParams, unknown>('plugin:chat|move_folder', params);
  store.dispatch(fetchConversations());
}

export interface DeleteMessageParams {
  id: number;
}

export async function deleteMessage(params: DeleteMessageParams) {
  await appInvoke<DeleteMessageParams, unknown>('plugin:chat|delete_message', params);
  store.dispatch(fetchConversations());
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
  store.dispatch(fetchConversations());
}

export enum ExportType {
  JSON = 'json',
  TXT = 'txt',
  CSV = 'csv',
}

export interface ExportConversationParams {
  id: number;
  path: string;
  exportType: ExportType;
}

export async function exportConversation(params: ExportConversationParams) {
  await appInvoke<ExportConversationParams, unknown>('plugin:chat|export', params);
}

export interface DeleteConversationParams {
  id: number;
}

export async function deleteConversationTemplate(params: DeleteConversationParams) {
  await appInvoke<DeleteConversationParams, unknown>('plugin:chat|delete_conversation_template', params);
  store.dispatch(fetchTemplates());
}

export interface AddConversationTemplateParams {
  data: NewConversationTemplate;
}

export async function addConversationTemplate(params: AddConversationTemplateParams) {
  const id = await appInvoke<AddConversationTemplateParams, number>('plugin:chat|add_conversation_template', params);
  store.dispatch(fetchTemplates());
  return id;
}

export interface UpdateConversationTemplateParams {
  data: NewConversationTemplate;
  id: number;
}

export async function updateConversationTemplate(params: UpdateConversationTemplateParams) {
  await appInvoke<UpdateConversationTemplateParams, unknown>('plugin:chat|update_conversation_template', params);
  store.dispatch(fetchTemplates());
}
