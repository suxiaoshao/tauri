import { Config } from '@chatgpt/features/Setting/types';
import { appInvoke } from './base';

export async function getConfig() {
  return await appInvoke<unknown, Config>('plugin:config|get_config', null);
}

export interface SetConfigParams {
  data: Config;
}

export async function setConfigService(params: SetConfigParams) {
  await appInvoke<SetConfigParams, unknown>('plugin:config|set_config', params);
}

export async function createSettingWindow() {
  await appInvoke<unknown, unknown>('plugin:config|create_setting_window', null);
}
