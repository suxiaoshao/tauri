import { Box, Button, TextField } from '@mui/material';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { InferType } from 'yup';
import { fetchData } from '../service/store';

const fetchInputSchema = yup.object().shape({
  url: yup.string().url('URL must be a valid HTTP URL').required('URL is required'),
  startPage: yup
    .number()
    .integer('startPage must be an integer')
    .min(1, 'startPage must be greater than or equal to 1')
    .required('startPage is required'),
  endPage: yup
    .number()
    .integer('endPage must be an integer')
    .min(yup.ref('startPage'), 'endPage must be greater than or equal to startPage')
    .required('endPage is required'),
  cookies: yup.string().required('cookies is required'),
});

export type FetchParams = InferType<typeof fetchInputSchema>;

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
