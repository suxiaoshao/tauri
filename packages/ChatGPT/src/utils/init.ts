/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2023-10-13 12:58:34
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-30 23:38:23
 * @FilePath: /tauri/packages/ChatGPT/src/utils/init.ts
 */
import store from '@chatgpt/app/store';
import { useConversationStore } from '@chatgpt/features/Conversations/conversationSlice';
import { fetchConfig, setConfig } from '@chatgpt/features/Setting/configSlice';
import { Message } from '@chatgpt/types/message';
import { appWindow } from '@tauri-apps/api/window';
import { listen } from '@tauri-apps/api/event';
import { Config } from '@chatgpt/features/Setting/types';
import { fetchTemplates } from '@chatgpt/features/Template/templateSlice';

export default async function init() {
  // fetch conversations data
  useConversationStore.getState().fetchConversations();

  // listen for messages
  await appWindow.listen<Message>('message', (response) => {
    useConversationStore.getState().updateMessage(response.payload);
  });

  // fetch config data
  store.dispatch(fetchConfig());

  // listen for config changes
  await listen<Config>('config', (event) => {
    store.dispatch(setConfig(event.payload));
  });

  // fetch templates data
  store.dispatch(fetchTemplates());
}
