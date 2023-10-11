import { ChatGptConfig } from '@chatgpt/features/Setting';
import { appInvoke } from './base';

export async function getConfig() {
  return await appInvoke<unknown, ChatGptConfig>('plugin:config|get_config', undefined);
}

export interface SetConfigParams {
  data: ChatGptConfig;
}

export async function setConfigService(params: SetConfigParams) {
  await appInvoke<SetConfigParams, unknown>('plugin:config|set_config', params);
}

export async function createSettingWindow() {
  await appInvoke<unknown, unknown>('plugin:config|create_setting_window', undefined);
}
