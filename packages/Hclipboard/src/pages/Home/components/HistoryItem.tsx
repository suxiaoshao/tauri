import { Box, Divider, Drawer, Link, ListItemButton, Typography } from '@mui/material';
import { ClipHistory } from '../../../rpc/query';
import formatTime from '../../../utils/formatTime';
import { useMemo, useState } from 'react';
import { encodeNonAsciiHTML } from 'entities';
import useElementSize from '../hooks/useElementSize';

export interface HistoryItemProps {
  item: ClipHistory;
  selected: boolean;
  isLast: boolean;
  index: number;
}

export default function HistoryItem({ item: { data, updateTime }, selected, isLast, index }: HistoryItemProps) {
  // 设置空格
  const dataList = useMemo(
    () => data.split('\n').map((value) => encodeNonAsciiHTML(value).replace(/ /g, '&nbsp;')),
    [data],
  );
  const [{ height } = { height: 0 }, ref] = useElementSize();
  const [open, setOpen] = useState(false);
  return (
    <>
      <ListItemButton sx={{ display: 'flex', overflowX: 'hidden' }} key={data} selected={selected}>
        <Box sx={{ flex: '0 0 80px' }}>
          <Typography color="text.secondary" variant={'body2'}>
            {formatTime(updateTime)}
          </Typography>
        </Box>
        <Box sx={{ flex: '1 1 calc(100% - 110px)', maxWidth: 'calc(100% - 110px)' }}>
          <Box sx={{ maxHeight: '120px', overflowY: 'hidden', width: '100%' }}>
            <Box ref={ref} sx={{ width: '100%' }}>
              {dataList.map((value) => (
                <Typography
                  sx={{ width: '100%', wordBreak: 'break-all' }}
                  variant={'body1'}
                  dangerouslySetInnerHTML={{ __html: value }}
                  key={value}
                ></Typography>
              ))}
            </Box>
          </Box>
          {height > 120 && (
            <Link
              onClick={(event) => {
                event.stopPropagation();
                setOpen(true);
              }}
              variant={'body2'}
            >
              查看全部 {'>>'}
            </Link>
          )}
        </Box>
        <Box sx={{ flex: '0 0 30px' }}>
          <Typography align={'right'} color="text.secondary" variant={'body2'}>
            {index + 1}
          </Typography>
        </Box>
      </ListItemButton>
      {!isLast && <Divider />}
      <Drawer anchor={'right'} open={open} onClose={() => setOpen(false)}>
        {
          <Box sx={{ padding: 1, width: '60vw' }}>
            {dataList.map((value) => (
              <Typography
                sx={{ width: '100%', wordBreak: 'break-all' }}
                variant={'body1'}
                dangerouslySetInnerHTML={{ __html: value }}
                key={value}
              ></Typography>
            ))}
          </Box>
        }
      </Drawer>
    </>
  );
}
