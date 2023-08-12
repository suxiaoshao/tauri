import store from '@chatgpt/app/store';
import { fetchConversations, updateMessage } from '@chatgpt/features/Conversations/conversationSlice';
import { ConfigSliceType, fetchConfig, setConfig } from '@chatgpt/features/Setting/configSlice';
import { Message } from '@chatgpt/types/message';
import { appWindow } from '@tauri-apps/api/window';
import { listen } from '@tauri-apps/api/event';

export default async function init() {
  store.dispatch(fetchConversations());
  await appWindow.listen<Message>('message', (response) => {
    store.dispatch(updateMessage(response.payload));
  });
  store.dispatch(fetchConfig());
  await listen<ConfigSliceType>('config', (event) => {
    store.dispatch(setConfig(event.payload));
  });
}
