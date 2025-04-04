import type { ExtensionConfig } from '@chatgpt/types/extension';
import { appInvoke } from './base';

export async function getAllExtensionConfig() {
  return await appInvoke<unknown, ExtensionConfig[]>('plugin:extensions|get_all_extensions', {});
}
