/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2023-10-13 12:58:34
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-30 23:38:23
 * @FilePath: /tauri/packages/ChatGPT/src/utils/init.ts
 */
import { useConversationStore } from '@chatgpt/features/Conversations/conversationSlice';
import { useConfigStore } from '@chatgpt/features/Setting/configSlice';
import { type Config } from '@chatgpt/features/Setting/types';
import { useTemplateStore } from '@chatgpt/features/Template/templateSlice';
import { type Message } from '@chatgpt/types/message';
import { type RouterEvent } from '@chatgpt/types/router';
import { listen } from '@tauri-apps/api/event';
import { appWindow } from '@tauri-apps/api/window';
import { resolveRouterEvent } from './router';

export async function initForFetch() {
  await Promise.all([
    useConversationStore.getState().fetchConversations(),
    useConfigStore.getState().fetchConfig(),
    useTemplateStore.getState().fetchTemplates(),
  ]);
}

export async function initForListen() {
  // listen for messages and config changes simultaneously
  await Promise.all([
    appWindow.listen<Message>('message', (response) => {
      useConversationStore.getState().updateMessage(response.payload);
    }),
    listen<Config>('config', (event) => {
      useConfigStore.getState().setConfig(event.payload);
    }),
    appWindow.listen<RouterEvent>('router_event', async (event) => {
      const { isUpdate, resolveFunc } = resolveRouterEvent(event.payload);
      if (isUpdate) {
        await initForFetch();
      }
      resolveFunc();
    }),
  ]);
}

export default async function init() {
  await initForFetch();
  await initForListen();
}
