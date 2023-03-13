import { Box, Button, Paper, TextField } from '@mui/material';
import { useForm } from 'react-hook-form';
import { invoke } from '@tauri-apps/api/tauri';
import { appWindow } from '@tauri-apps/api/window';
import { useAppSelector } from '../../app/hooks';
import { ConfigSliceType } from './configSlice';

export default function Setting() {
  const initData = useAppSelector((state) => state.config);
  const { register, handleSubmit } = useForm<ConfigSliceType>({ defaultValues: initData });

  const onSubmit = handleSubmit(async (data) => {
    await invoke('plugin:config|set_config', { data });
    await appWindow.close();
  });
  return (
    <Box sx={{ width: '100%', height: '100%' }} component={Paper} square>
      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{
          p: 2,
          paddingX: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <TextField required {...register('api_key', { required: true })} label="openai api key" fullWidth />
        <Box sx={{ mt: 2, width: '100%', display: 'flex', flexDirection: 'row-reverse' }}>
          <Button variant="contained" type="submit">
            submit
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
