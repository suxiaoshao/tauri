/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2023-10-13 12:58:34
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2023-11-07 12:26:31
 * @FilePath: /tauri/packages/ChatGPT/src/utils/init.ts
 */
import store from '@chatgpt/app/store';
import { fetchConversations, updateMessage } from '@chatgpt/features/Conversations/conversationSlice';
import { fetchConfig, setConfig } from '@chatgpt/features/Setting/configSlice';
import { Message } from '@chatgpt/types/message';
import { appWindow } from '@tauri-apps/api/window';
import { listen } from '@tauri-apps/api/event';
import { ChatGptConfig } from '@chatgpt/features/Setting';

export default async function init() {
  store.dispatch(fetchConversations());
  await appWindow.listen<Message>('message', (response) => {
    store.dispatch(updateMessage(response.payload));
  });
  store.dispatch(fetchConfig());
  await listen<ChatGptConfig>('config', (event) => {
    store.dispatch(setConfig(event.payload));
  });
}
