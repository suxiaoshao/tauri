/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-03-07 00:42:35
 * @FilePath: /self-tools/Users/sushao/Documents/code/tauri/packages/Hclipboard/src/pages/Home/index.tsx
 */
import { Box, List, TextField } from '@mui/material';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useKey } from 'react-use';
import HistoryItem from './components/HistoryItem';
import useClipData from './hooks/useClipData';
const appWindow = getCurrentWebviewWindow();

export default function Home() {
  // 表单
  const { register, watch, setValue } = useForm<{ searchData?: string }>();
  const searchName = watch('searchData');
  // 历史记录
  const data = useClipData(searchName);
  // 被选择
  const [selectIndex, setSelectIndex] = useState<number>(0);
  useEffect(() => {
    setSelectIndex(0);
  }, [data]);
  const add = useCallback(() => {
    if (selectIndex < data.length - 1) {
      setSelectIndex((value) => value + 1);
    }
  }, [data.length, selectIndex]);
  const sub = useCallback(() => {
    if (selectIndex >= 1) {
      setSelectIndex((value) => value - 1);
    }
  }, [selectIndex]);
  useKey('ArrowUp', sub, undefined, [sub]);
  useKey('ArrowDown', add, undefined, [add]);
  useKey(
    'Enter',
    async () => {
      const item = data[selectIndex];
      await writeText(item.data);
      await appWindow.hide();
    },
    undefined,
    [data, selectIndex],
  );
  useEffect(() => {
    const fn = appWindow.onFocusChanged(() => {
      setValue('searchData', '');
    });
    return () => {
      (async () => {
        const f = await fn;
        f();
      })();
    };
  }, [setValue]);
  return (
    <Box
      sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 1 }}
    >
      <TextField
        placeholder="搜索"
        sx={{ margin: 1 }}
        {...register('searchData')}
        slotProps={{ htmlInput: { spellCheck: 'false' } }}
      />
      <List sx={{ flex: '1 1 0', overflowY: 'auto', width: '100%' }}>
        {data.map((item, index) => (
          <HistoryItem
            index={index}
            key={item.id}
            item={item}
            selected={selectIndex === index}
            isLast={index === data.length - 1}
          />
        ))}
      </List>
    </Box>
  );
}
