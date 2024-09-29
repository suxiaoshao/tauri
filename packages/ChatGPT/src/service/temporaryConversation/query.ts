import { type TemporaryConversation } from '@chatgpt/types/temporaryConversation';
import { appInvoke } from '../base';

export interface FindTemporaryMessageParams {
  id: number;
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
