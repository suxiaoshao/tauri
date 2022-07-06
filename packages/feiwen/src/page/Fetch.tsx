import { Box, Button, TextField } from '@mui/material';
import { invoke } from '@tauri-apps/api/tauri';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

interface FetchInput {
  url: string;
  startPage: number;
  endPage: number;
  cookies: string;
}

export default function Fetch() {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<FetchInput>();
  const onSubmit: SubmitHandler<FetchInput> = async (formData) => {
    invoke('fetch', { ...formData }).catch(console.error);
    console.log(formData);
  };
  return (
    <>
      <Button onClick={() => navigate(-1)}>back</Button>
      <Box
        component={'form'}
        sx={{ display: 'flex', flexDirection: 'column', padding: 1 }}
        onSubmit={handleSubmit(onSubmit)}
      >
        <TextField sx={{ paddingBottom: 1 }} label="url" required {...register('url', { required: true })} />
        <TextField
          sx={{ paddingBottom: 1 }}
          type={'number'}
          label="startPage"
          required
          {...register('startPage', { required: true, valueAsNumber: true })}
        />
        <TextField
          sx={{ paddingBottom: 1 }}
          type={'number'}
          label="endPage"
          required
          {...register('endPage', { required: true, valueAsNumber: true })}
        />
        <TextField sx={{ paddingBottom: 1 }} label="cookies" required {...register('cookies', { required: true })} />
        <Box>
          <Button type="submit">获取数据</Button>
        </Box>
      </Box>
    </>
  );
}
