import type { Enum } from 'types';
import { appInvoke } from './base';

export interface AdapterInputs {
  name: string;
  inputs: [InputItem];
}

export interface InputItem {
  id: string;
  name: string;
  description: string;
  inputType: InputType;
}

export type InputBaseType = Enum<'text'> | Enum<'float'> | Enum<'boolean'> | Enum<'integer'> | Enum<'select', string[]>;

export type InputType = Enum<'array', InputBaseType> | Enum<'object', Record<string, InputBaseType>> | InputBaseType;

export async function getAdapterSettingInputs(): Promise<[AdapterInputs]> {
  return await appInvoke<unknown, [AdapterInputs]>('plugin:adapter|get_adapter_setting_inputs', {});
}
