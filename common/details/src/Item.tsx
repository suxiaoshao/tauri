/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-30 00:42:28
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 02:47:11
 * @FilePath: /tauri/common/details/src/Item.tsx
 */
import { Box, Typography } from '@mui/material';
import { DetailsItem } from './Details';

export default function Item({ label, value, span }: Omit<DetailsItem, 'key'>) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        ...(span
          ? {
              gridColumn: `span ${span}`,
            }
          : {}),
      }}
    >
      <Typography variant="subtitle1">{label}</Typography>
      <Typography variant="body1">{value ?? '-'}</Typography>
    </Box>
  );
}
