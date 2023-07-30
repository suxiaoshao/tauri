import store from '@chatgpt/app/store';
import { fetchConversations } from '@chatgpt/features/Conversations/conversationSlice';

export default async function init() {
  store.dispatch(fetchConversations());
}
