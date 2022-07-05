import { Enum } from './type';

export type RequestBody =
  | Enum<'none', undefined>
  | Enum<'raw', RawBody>
  | Enum<'form-data', FormDataItem[]>
  | Enum<'x-www-form-urlencoded', XFormItem[]>
  | Enum<'binary', ArrayBuffer>;

export type RawBody =
  | Enum<'json', string>
  | Enum<'javascript', string>
  | Enum<'css', string>
  | Enum<'xml', string>
  | Enum<'html', string>
  | Enum<'svg', string>
  | Enum<'plain', string>;

export type FormDataItem = {
  key: string;
  value: Enum<'text', string> | Enum<'file', File>;
};

export type XFormItem = {
  key: string;
  value: string;
};
