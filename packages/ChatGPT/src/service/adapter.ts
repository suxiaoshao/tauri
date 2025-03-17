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

type __InputType =
  | Enum<
      'text',
      {
        maxLen?: number;
        minLen?: number;
      }
    >
  | Enum<
      'float',
      {
        max?: number;
        min?: number;
        step?: number;
        default?: number;
      }
    >
  | Enum<
      'boolean',
      {
        default?: boolean;
      }
    >
  | Enum<
      'integer',
      {
        max?: number;
        min?: number;
        step?: number;
        default?: number;
      }
    >
  | Enum<'select', string[]>
  | Enum<
      'array',
      {
        inputType: Exclude<InputType, 'array' | 'optional'>;
        name: string;
        description: string;
      }
    >
  | Enum<'arrayObject', InputItem[]>
  | Enum<'object', InputItem[]>;

export type InputType = __InputType | Enum<'optional', __InputType>;

export async function getAdapterSettingInputs(): Promise<[AdapterInputs]> {
  return await appInvoke<unknown, [AdapterInputs]>('plugin:adapter|get_adapter_setting_inputs', {});
}
