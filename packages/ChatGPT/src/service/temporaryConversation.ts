import { type TemporaryMessage } from '@chatgpt/types/temporaryConversation';
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
}

export async function temporaryFetch(params: TemporaryFetchParams) {
  return await appInvoke<TemporaryFetchParams, unknown>('plugin:temporary_conversation|temporary_fetch', params);
}

export interface DeleteTemporaryMessageParams {
  id: number;
}

export async function deleteTemporaryMessage(params: DeleteTemporaryMessageParams) {
  return await appInvoke<DeleteTemporaryMessageParams, TemporaryMessage[]>(
    'plugin:temporary_conversation|delete_temporary_message',
    params,
  );
}

export interface FindTemporaryMessageParams {
  id: number;
}

export async function separateWindow() {
  return await appInvoke<undefined, unknown>('plugin:temporary_conversation|separate_window', undefined);
}
