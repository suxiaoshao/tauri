import { type TemporaryMessage, type TemporaryConversation } from '@chatgpt/types/temporaryConversation';
import { appInvoke } from '../base';

export interface FindTemporaryMessageParams {
  persistentId: number | null;
  messageId: number;
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

export async function getTemporaryMessage(params: FindTemporaryMessageParams) {
  return await appInvoke<FindTemporaryMessageParams, TemporaryMessage>(
    'plugin:temporary_conversation|get_temporary_message',
    params,
  );
}
