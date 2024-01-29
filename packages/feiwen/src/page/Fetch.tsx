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
import { Input, object, string, url, number, integer, minValue, forward, custom } from 'valibot';
import { fetchData } from '../service/store';

const fetchInputSchema = object(
  {
    url: string([url()]),
    startPage: number([integer(), minValue(1)]),
    endPage: number([integer(), minValue(1)]),
    cookies: string(),
  },
  [
    forward(
      custom((input) => input.startPage < input.endPage, 'endPage must be greater than or equal to startPage'),
      ['endPage'],
    ),
  ],
);

export type FetchParams = Input<typeof fetchInputSchema>;

export default function Fetch() {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<FetchParams>();
  const onSubmit: SubmitHandler<FetchParams> = async (formData) => {
    fetchData(formData);
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
