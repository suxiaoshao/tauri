/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2023-10-13 12:58:34
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-30 23:38:23
 * @FilePath: /tauri/packages/ChatGPT/src/utils/init.ts
 */
import { useConversationStore } from '@chatgpt/features/Conversations/conversationSlice';
import { useConfigStore } from '@chatgpt/features/Setting/configSlice';
import { Config } from '@chatgpt/features/Setting/types';
import { useTemplateStore } from '@chatgpt/features/Template/templateSlice';
import { Message } from '@chatgpt/types/message';
import { listen } from '@tauri-apps/api/event';
import { appWindow } from '@tauri-apps/api/window';

export default async function init() {
  // fetch conversations data
  useConversationStore.getState().fetchConversations();

  // listen for messages
  await appWindow.listen<Message>('message', (response) => {
    useConversationStore.getState().updateMessage(response.payload);
    console.log(response.payload);
  });

  // fetch config data
  useConfigStore.getState().fetchConfig();

  // listen for config changes
  await listen<Config>('config', (event) => {
    useConfigStore.getState().setConfig(event.payload);
  });

  // fetch templates data
  useTemplateStore.getState().fetchTemplates();
}
