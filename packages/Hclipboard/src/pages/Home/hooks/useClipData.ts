import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { useCallback, useEffect, useState } from 'react';
import { type ClipHistory, query } from '../../../rpc/query';
const appWindow = getCurrentWebviewWindow();

export default function useClipData(searchName: string | undefined) {
  // 剪切板历史
  const [data, setDate] = useState([] as ClipHistory[]);
  // 查询剪切板历史
  const fetchData = useCallback(async () => {
    const newData = await query({ searchName: searchName || null });
    setDate(newData);
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
