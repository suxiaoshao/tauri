import { Box, Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function Error() {
  const { t } = useTranslation();
  return (
    <Box sx={{ width: '100%', height: '100%' }} component={Paper} square>
      <Box
        sx={{
          p: 2,
          paddingX: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h5" gutterBottom component="div">
          {t('error')}
        </Typography>
        <Typography variant="body1" gutterBottom component="div">
          {t('error_page_message')}
        </Typography>
      </Box>
    </Box>
  );
}
