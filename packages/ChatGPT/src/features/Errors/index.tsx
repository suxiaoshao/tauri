import { Box, Paper, Typography } from '@mui/material';

export default function Error() {
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
          Error
        </Typography>
        <Typography variant="body1" gutterBottom component="div">
          Please set your openai api key in setting page.
        </Typography>
      </Box>
    </Box>
  );
}
