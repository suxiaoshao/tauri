/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2023-10-13 12:58:34
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2023-11-07 13:01:55
 * @FilePath: /tauri/packages/ChatGPT/src/types/common.ts
 */
export enum Status {
  Normal = 'normal',
  Hidden = 'hidden',
  Loading = 'loading',
  Error = 'error',
}

export enum Mode {
  Contextual = 'contextual',
  Single = 'single',
  AssistantOnly = 'assistant-only',
}

export enum Role {
  system = 'system',
  user = 'user',
  assistant = 'assistant',
}

export enum Model {
  Gpt35 = 'gpt-3.5-turbo',
  Gpt35_16k = 'gpt-3.5-turbo-16k',
  Gpt35instruct = 'gpt-3.5-turbo-instruct',
  Gpt4 = 'gpt-4',
  Gpt41106preview = 'gpt-4-1106-preview',
}
