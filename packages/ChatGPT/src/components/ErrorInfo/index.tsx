/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-29 01:48:57
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-29 02:08:04
 * @FilePath: /tauri/packages/ChatGPT/src/components/ErrorInfo/index.tsx
 */
import { Alert, Box, type BoxProps, Link, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export interface ErrorInfoProps extends BoxProps {
  error: Error;
  refetch?: () => void;
}

export default function ErrorInfo({ error, refetch, sx, ...props }: ErrorInfoProps) {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        paddingTop: '20vh',
        ...sx,
      }}
      {...props}
    >
      <Box
        sx={{
          p: 2,
          paddingX: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          gap: 2,
        }}
      >
        <Alert sx={{ width: '70%' }} variant="filled" severity="error">
          {t('error')} : {error.message}
        </Alert>
        {refetch && (
          <Typography variant="body1" gutterBottom component="div">
            {t('error_page_button_tips1')}
            <Link component="button" variant="body1" onClick={refetch}>
              {t('error_page_button_tips2')}
            </Link>
            {t('error_page_button_tips3')}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
