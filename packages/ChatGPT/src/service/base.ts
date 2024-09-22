/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2023-09-06 17:14:35
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 02:42:45
 * @FilePath: /tauri/packages/ChatGPT/src/service/base.ts
 */
import { invoke } from '@tauri-apps/api';
import { InvokeArgs } from '@tauri-apps/api/tauri';
import { enqueueSnackbar } from 'notify';
import { object, string, enum_, parseAsync, nullish } from 'valibot';

export interface ChatGPTError {
  code: ChatGPTErrorCodes;
  message: string;
  data?: string; // Optional, only used for some error types
}

export enum ChatGPTErrorCodes {
  ConfigPath = 'ConfigPath',
  Setup = 'Setup',
  Tauri = 'Tauri',
  Sqlite = 'Sqlite',
  Connection = 'Connection',
  Pool = 'Pool',
  GetConnection = 'GetConnection',
  Fs = 'Fs',
  Shadow = 'Shadow',
  Vibrancy = 'Vibrancy',
  HeaderParse = 'HeaderParse',
  Request = 'Request',
  TomlParse = 'TomlParse',
  TomlSerialize = 'TomlSerialize',
  Notify = 'Notify',
  EventSource = 'EventSource',
  SerdeJson = 'SerdeJson',
  ApiKeyNotSet = 'ApiKeyNotSet',
  Path = 'Path',
  DbPath = 'DbPath',
  InvalidMode = 'InvalidMode',
  InvalidRole = 'InvalidRole',
  InvalidMessageStatus = 'InvalidMessageStatus',
  InvalidTimeFormat = 'InvalidTimeFormat',
  InvalidModel = 'InvalidModel',
  WindowNotFound = 'WindowNotFound',
  ConversationPathExists = 'ConversationPathExists',
  FolderPathExists = 'FolderPathExists',
  CsvParse = 'CsvParse',
  TemplateHasConversation = 'TemplateHasConversation',
}

const ChatGPTErrorCodesSchema = enum_(ChatGPTErrorCodes);

const ChatGPTErrorSchema = object({
  code: ChatGPTErrorCodesSchema,
  message: string(),
  data: nullish(string()),
});

export async function appInvoke<P, R>(cmd: string, params: P): Promise<R> {
  try {
    const response = await invoke<R>(cmd, params as InvokeArgs);
    return response;
  } catch (error) {
    if (error instanceof Error) {
      await enqueueSnackbar(error.message, { variant: 'error' });
    } else if (typeof error === 'string') {
      await enqueueSnackbar(error, { variant: 'error' });
    } else {
      try {
        const err = await parseAsync(ChatGPTErrorSchema, error);
        await enqueueSnackbar(err.message, { variant: 'error' });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Validation failed:', error);
        await enqueueSnackbar('An unknown error occurred', { variant: 'error' });
      }
    }
    // eslint-disable-next-line no-console
    console.error('source error:', error);
    throw error;
  }
}
