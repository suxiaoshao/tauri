import { Box, Divider, Drawer, Link, ListItemButton, Typography } from '@mui/material';
import { encodeNonAsciiHTML } from 'entities';
import { useMemo, useState } from 'react';
import { type ClipHistory } from '../../../rpc/query';
import formatTime from '../../../utils/formatTime';

export interface HistoryItemProps {
  item: ClipHistory;
  selected: boolean;
  isLast: boolean;
  index: number;
  onClick?: () => void;
  ref?: React.Ref<HTMLDivElement> | undefined;
}

export default function HistoryItem({
  item: { data, updateTime },
  selected,
  isLast,
  index,
  onClick,
  ref,
}: HistoryItemProps) {
  // 设置空格
  const dataList = useMemo(
    () => data.split('\n').map((value) => encodeNonAsciiHTML(value).replaceAll(' ', '&nbsp;')),
    [data],
  );
  const [open, setOpen] = useState(false);
  return (
    <>
      <ListItemButton ref={ref} sx={{ display: 'flex', overflowX: 'hidden' }} selected={selected} onClick={onClick}>
        <Box sx={{ flex: '0 0 80px' }}>
          <Typography color="text.secondary" variant="body2">
            {formatTime(updateTime)}
          </Typography>
        </Box>
        <Box sx={{ flex: '1 1 calc(100% - 110px)', maxWidth: 'calc(100% - 110px)' }}>
          <Box sx={{ maxHeight: '120px', overflowY: 'hidden', width: '100%' }}>
            <Box sx={{ width: '100%' }}>
              {dataList.map((value, index) => (
                <Typography
                  sx={{ width: '100%', wordBreak: 'break-all' }}
                  variant="body1"
                  // eslint-disable-next-line no-danger
                  dangerouslySetInnerHTML={{ __html: value }}
                  key={index}
                />
              ))}
            </Box>
          </Box>
          {dataList.length > 6 && (
            <Link
              onClick={(event) => {
                event.stopPropagation();
                setOpen(true);
              }}
              variant="body2"
            >
              查看全部 {'>>'}
            </Link>
          )}
        </Box>
        <Box sx={{ flex: '0 0 30px' }}>
          <Typography align="right" color="text.secondary" variant="body2">
            {index + 1}
          </Typography>
        </Box>
      </ListItemButton>
      {!isLast && <Divider />}
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ padding: 1, width: '60vw' }}>
          {dataList.map((value, index) => (
            <Typography
              sx={{ width: '100%', wordBreak: 'break-all' }}
              variant="body1"
              // eslint-disable-next-line no-danger
              dangerouslySetInnerHTML={{ __html: value }}
              key={index}
            />
          ))}
        </Box>
      </Drawer>
    </>
  );
}
