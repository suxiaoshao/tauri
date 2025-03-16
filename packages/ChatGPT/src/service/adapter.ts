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
  required: boolean;
}

export type InputBaseType = Enum<'text'> | Enum<'float'> | Enum<'boolean'> | Enum<'integer'> | Enum<'select', string[]>;

export type InputType =
  | Enum<'text'>
  | Enum<'float'>
  | Enum<'boolean'>
  | Enum<'integer'>
  | Enum<'select', string[]>
  | Enum<
      'array',
      {
        inputType: InputType;
        name: string;
        required: boolean;
        description: string;
      }
    >
  | Enum<'object', Record<string, InputBaseType>>;

export async function getAdapterSettingInputs(): Promise<[AdapterInputs]> {
  return await appInvoke<unknown, [AdapterInputs]>('plugin:adapter|get_adapter_setting_inputs', {});
}
