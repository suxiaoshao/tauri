import { Box, List, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useCallback, useEffect, useState } from 'react';
import { ClipHistory, query } from '../../rpc/query';
import HistoryItem from './components/HistoryItem';

export default function Home() {
  // 表单
  const { register, watch } = useForm<{ searchData?: string }>();
  const searchName = watch('searchData');
  // 剪切板历史
  const [data, setDate] = useState([] as ClipHistory[]);
  // 查询剪切板历史
  const fetchData = useCallback(async () => {
    const newData = await query({ searchName: searchName || null });
    setDate(newData);
  }, [searchName]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  // 被选择
  const [selectIndex, setSelectIndex] = useState<number | null>(null);
  useEffect(() => {
    if (data.length > 0) {
      setSelectIndex(0);
    } else {
      setSelectIndex(null);
    }
  }, [data]);
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
