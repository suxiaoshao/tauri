/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2023-10-13 12:58:34
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-01-29 18:18:34
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
