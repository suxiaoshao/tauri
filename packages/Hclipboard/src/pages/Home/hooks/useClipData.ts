import { useCallback, useEffect, useState } from 'react';
import { ClipHistory, query } from '../../../rpc/query';
import { appWindow } from '@tauri-apps/api/window';

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
      unlisten.then((e) => e());
    };
  }, [fetchData]);
  return data;
}
