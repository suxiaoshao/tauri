import store from '@chatgpt/app/store';
import { fetchConversations, updateMessage } from '@chatgpt/features/Conversations/conversationSlice';
import { Message } from '@chatgpt/types/message';
import { appWindow } from '@tauri-apps/api/window';

export default async function init() {
  store.dispatch(fetchConversations());
  await appWindow.listen<Message>('message', (response) => {
    store.dispatch(updateMessage(response.payload));
  });
}
