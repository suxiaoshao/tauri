import { Box, Divider, Drawer, Link, ListItemButton, Typography } from '@mui/material';
import { ClipHistory } from '../../../rpc/query';
import formatTime from '../../../utils/formatTime';
import { useMemo, useState } from 'react';
import { useSize } from 'react-use';

export interface HistoryItemProps {
  item: ClipHistory;
  selected: boolean;
  isLast: boolean;
  index: number;
}

export default function HistoryItem({ item: { data, updateTime }, selected, isLast, index }: HistoryItemProps) {
  const dataList = useMemo(() => data.split('\n'), [data]);
  const [sized, { height }] = useSize(() => (
    <Box>
      {dataList.map((value) => (
        <Typography variant={'body1'} key={value}>
          {value}
        </Typography>
      ))}
    </Box>
  ));
  const [open, setOpen] = useState(false);
  return (
    <>
      <ListItemButton sx={{ display: 'flex', overflowX: 'hidden' }} key={data} selected={selected}>
        <Box sx={{ flex: '0 0 80px' }}>
          <Typography color="text.secondary" variant={'body2'}>
            {formatTime(updateTime)}
          </Typography>
        </Box>
        <Box sx={{ flex: '1 1 0' }}>
          <Box sx={{ maxHeight: '120px', overflow: 'hidden' }}>{sized}</Box>{' '}
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
              <Typography variant={'body1'} key={value}>
                {value}
              </Typography>
            ))}
          </Box>
        }
      </Drawer>
    </>
  );
}
