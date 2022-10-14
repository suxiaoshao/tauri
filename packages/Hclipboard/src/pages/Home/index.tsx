import { Box, List, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useCallback, useEffect, useState } from 'react';
import HistoryItem from './components/HistoryItem';
import useClipData from './hooks/useClipData';
import { useKey } from 'react-use';
import { appWindow } from '@tauri-apps/api/window';
import { writeText } from '@tauri-apps/api/clipboard';

export default function Home() {
  // 表单
  const { register, watch } = useForm<{ searchData?: string }>();
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
  return (
    <Box
      sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 1 }}
    >
      <TextField
        placeholder="搜索"
        sx={{ margin: 1 }}
        {...register('searchData')}
        autoFocus
        inputProps={{ spellcheck: 'false' }}
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
