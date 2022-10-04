import { Divider, ListItemButton, ListItemText } from '@mui/material';
import { ClipHistory } from '../../../rpc/query';
import formatTime from '../../../utils/formatTime';

export interface HistoryItemProps {
  item: ClipHistory;
  selected: boolean;
  isLast: boolean;
}

export default function HistoryItem({ item: { data, updateTime }, selected, isLast }: HistoryItemProps) {
  return (
    <>
      <ListItemButton key={data} selected={selected}>
        <ListItemText primaryTypographyProps={{}} primary={data} secondary={formatTime(updateTime)} />
      </ListItemButton>
      {isLast && <Divider />}
    </>
  );
}
