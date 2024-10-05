import { useTemporaryConversationStore } from '@chatgpt/features/Temporary/Detail/temporaryDetailSlice';
import { type SaveTemporaryConversation } from '@chatgpt/types/temporaryConversation';
import { appInvoke } from '@feiwen/service/base';

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
  await appInvoke<DeleteTemporaryMessageParams, unknown>(
    'plugin:temporary_conversation|delete_temporary_message',
    params,
  );
  useTemporaryConversationStore.getState().fetchData(params.persistentId);
}

export async function separateWindow() {
  return await appInvoke<null, unknown>('plugin:temporary_conversation|separate_window', null);
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

export interface ClearTemporaryConversationParams {
  persistentId: number | null;
}

export async function clearTemporaryConversation(params: ClearTemporaryConversationParams) {
  await appInvoke<ClearTemporaryConversationParams, unknown>(
    'plugin:temporary_conversation|clear_temporary_conversation',
    params,
  );
  useTemporaryConversationStore.getState().fetchData(params.persistentId);
}

export interface SaveTemporaryConversationParams {
  data: SaveTemporaryConversation;
}

export async function saveTemporaryConversation(params: SaveTemporaryConversationParams) {
  await appInvoke<SaveTemporaryConversationParams, unknown>(
    'plugin:temporary_conversation|save_temporary_conversation',
    params,
  );
}
