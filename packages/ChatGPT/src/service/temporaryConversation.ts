import { type TemporaryConversation } from '@chatgpt/types/temporaryConversation';
import { appInvoke } from './base';

export interface InitTemporaryConversationParams {
  templateId: number;
}

export async function initTemporaryConversation(params: InitTemporaryConversationParams) {
  return await appInvoke<InitTemporaryConversationParams, unknown>(
    'plugin:temporary_conversation|init_temporary_conversation',
    params,
  );
}

export interface TemporaryFetchParams {
  content: string;
  persistentId: number | null;
}

export async function temporaryFetch(params: TemporaryFetchParams) {
  return await appInvoke<TemporaryFetchParams, unknown>('plugin:temporary_conversation|temporary_fetch', params);
}

export interface DeleteTemporaryMessageParams {
  messageId: number;
  persistentId: number | null;
}

export async function deleteTemporaryMessage(params: DeleteTemporaryMessageParams) {
  return await appInvoke<DeleteTemporaryMessageParams, TemporaryConversation>(
    'plugin:temporary_conversation|delete_temporary_message',
    params,
  );
}

export interface FindTemporaryMessageParams {
  id: number;
}

export async function separateWindow() {
  return await appInvoke<null, unknown>('plugin:temporary_conversation|separate_window', null);
}

export interface GetTemporaryConversationsParams {
  persistentId: number | null;
}

export async function getTemporaryConversation(params: GetTemporaryConversationsParams) {
  return await appInvoke<GetTemporaryConversationsParams, TemporaryConversation>(
    'plugin:temporary_conversation|get_temporary_conversation',
    params,
  );
}

export interface DeleteTemporaryConversationParams {
  persistentId: number | null;
}

export async function deleteTemporaryConversation(params: DeleteTemporaryConversationParams) {
  return await appInvoke<DeleteTemporaryConversationParams, unknown>(
    'plugin:temporary_conversation|delete_temporary_conversation',
    params,
  );
}
