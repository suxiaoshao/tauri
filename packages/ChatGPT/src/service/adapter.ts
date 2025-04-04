import { appInvoke } from './base';
import type { AdapterInputs } from '../types/adapter';

export async function getAllAdapterSettingInputs(): Promise<[AdapterInputs]> {
  return await appInvoke<unknown, [AdapterInputs]>('plugin:adapter|get_all_adapter_setting_inputs', {});
}

export async function getAllAdapterTemplateInputs(): Promise<[AdapterInputs]> {
  return await appInvoke<unknown, [AdapterInputs]>('plugin:adapter|get_all_adapter_template_inputs', {});
}

export interface GetAdapterTemplateInputsParams {
  adapterName: string;
}

export async function getAdapterTemplateInputs(params: GetAdapterTemplateInputsParams): Promise<AdapterInputs> {
  return await appInvoke<unknown, AdapterInputs>('plugin:adapter|get_adapter_template_inputs', params);
}
