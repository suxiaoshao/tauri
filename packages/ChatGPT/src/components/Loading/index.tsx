/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-29 02:11:33
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-29 02:16:42
 * @FilePath: /tauri/packages/ChatGPT/src/components/Loading/index.tsx
 */
import { Box, BoxProps, CircularProgress } from '@mui/material';

export default function Loading({ sx, ...props }: BoxProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', ...sx }} {...props}>
      <CircularProgress size={80} />
    </Box>
  );
}
