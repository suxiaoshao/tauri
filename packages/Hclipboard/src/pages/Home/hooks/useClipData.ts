import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { useCallback, useEffect, useState } from 'react';
import { query } from '../../../rpc/query';
import { decode } from 'cbor2';
import { array, blob, enum_, type InferOutput, integer, number, object, parse, pipe, instance } from 'valibot';
const appWindow = getCurrentWebviewWindow();

export enum ClipType {
  Text = 'text',
  Image = 'image',
  Html = 'html',
  Rtf = 'rtf',
  Files = 'files',
}

const ClipHistorySchema = array(
  object({
    id: pipe(number(), integer()),
    data: instance(Uint8Array),
    type: enum_(ClipType),
    updateTime: number(),
  }),
);

export type ClipHistory = InferOutput<typeof ClipHistorySchema>[0];

export default function useClipData(searchName: string | undefined) {
  // 剪切板历史
  const [data, setDate] = useState([] as ClipHistory[]);
  // 查询剪切板历史
  const fetchData = useCallback(async () => {
    const newData = await query({ searchName: searchName || null });
    console.log(newData, decode(new Uint8Array(newData)));
    const data = parse(ClipHistorySchema, decode(new Uint8Array(newData)));
    setDate(data);
  }, [searchName]);
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
