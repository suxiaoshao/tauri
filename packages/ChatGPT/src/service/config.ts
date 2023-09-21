import { ConfigSliceType } from '@chatgpt/features/Setting/configSlice';
import { appInvoke } from './base';

export async function getConfig() {
  return await appInvoke<unknown, ConfigSliceType>('plugin:config|get_config', undefined);
}

export interface SetConfigParams {
  data: ConfigSliceType;
}

export async function setConfigService(params: SetConfigParams) {
  await appInvoke<SetConfigParams, unknown>('plugin:config|set_config', params);
}

export async function createSettingWindow() {
  await appInvoke<unknown, unknown>('plugin:config|create_setting_window', undefined);
}
