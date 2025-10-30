import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { useCallback, useEffect, useState } from 'react';
import { ClipboardType, query, type QueryHistoryRequest } from '../../../rpc/query';
import { decode } from 'cbor2';
import {
  array,
  type InferOutput,
  integer,
  number,
  object,
  parse,
  pipe,
  instance,
  union,
  literal,
  string,
} from 'valibot';
const appWindow = getCurrentWebviewWindow();

const ClipHistorySchema = array(
  object({
    id: pipe(number(), integer()),
    data: union([
      object({
        tag: literal(ClipboardType.Text),
        value: object({
          text: string(),
          wordCount: pipe(number(), integer()),
          charCount: pipe(number(), integer()),
        }),
      }),
      object({
        tag: literal(ClipboardType.Image),
        value: object({
          data: instance(Uint8Array<ArrayBuffer>),
          width: pipe(number(), integer()),
          height: pipe(number(), integer()),
          size: pipe(number(), integer()),
        }),
      }),
      object({
        tag: literal(ClipboardType.Files),
        value: array(string()),
      }),
      object({
        tag: literal(ClipboardType.Rtf),
        value: object({
          text: string(),
          plainText: string(),
          wordCount: pipe(number(), integer()),
          charCount: pipe(number(), integer()),
        }),
      }),
      object({
        tag: literal(ClipboardType.Html),
        value: object({
          text: string(),
          plainText: string(),
          wordCount: pipe(number(), integer()),
          charCount: pipe(number(), integer()),
        }),
      }),
    ]),
    updateTime: number(),
  }),
);

export type ClipHistory = InferOutput<typeof ClipHistorySchema>[0];

export default function useClipData(state: QueryHistoryRequest) {
  // 剪切板历史
  const [data, setDate] = useState([] as ClipHistory[]);
  // 查询剪切板历史
  const fetchData = useCallback(async () => {
    const newData = await query(state);
    const data = parse(ClipHistorySchema, decode(new Uint8Array(newData)));
    setDate(data);
  }, [state]);
  useEffect(() => {
    fetchData();
    // 重新获取焦点时刷新数据
    const unlisten = appWindow.onFocusChanged((handle) => {
      if (handle) {
        fetchData();
      }
    });
    return () => {
      (async () => {
        const f = await unlisten;
        f();
      })();
    };
  }, [fetchData]);
  return data;
}
