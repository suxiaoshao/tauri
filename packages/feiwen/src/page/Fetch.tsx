/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-01-29 20:56:39
 * @FilePath: /tauri/packages/feiwen/src/page/Fetch.tsx
 */
import { Box, Button, TextField } from '@mui/material';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { fetchData } from '../service/store';
import { FetchParams } from './types';

export default function Fetch() {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<FetchParams>();
  const onSubmit: SubmitHandler<FetchParams> = (formData) => {
    fetchData(formData);
  };
  return (
    <>
      <Button onClick={() => navigate(-1)}>back</Button>
      <Box
        component="form"
        sx={{ display: 'flex', flexDirection: 'column', padding: 1 }}
        onSubmit={handleSubmit(onSubmit)}
      >
        <TextField sx={{ paddingBottom: 1 }} label="url" required {...register('url', { required: true })} />
        <TextField
          sx={{ paddingBottom: 1 }}
          type="number"
          label="startPage"
          required
          {...register('startPage', { required: true, valueAsNumber: true })}
        />
        <TextField
          sx={{ paddingBottom: 1 }}
          type="number"
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
