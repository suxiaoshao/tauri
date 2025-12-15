/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-01-29 20:56:39
 * @FilePath: /tauri/packages/feiwen/src/page/Fetch.tsx
 */
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { fetchData } from '../service/store';
import { type FetchParams } from './types';
import { Button } from '@feiwen/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@feiwen/components/ui/field';
import { Input } from '@feiwen/components/ui/input';

export default function Fetch() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FetchParams>();
  const onSubmit: SubmitHandler<FetchParams> = (formData) => {
    fetchData(formData);
  };
  return (
    <form className="flex flex-col p-2" onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel>url</FieldLabel>
          <Input required {...register('url', { required: true })} />
          <FieldError errors={[errors.url]} />
        </Field>
        <Field>
          <FieldLabel>startPage</FieldLabel>
          <Input type="number" required {...register('startPage', { required: true })} />
          <FieldError errors={[errors.startPage]} />
        </Field>
        <Field>
          <FieldLabel>endPage</FieldLabel>
          <Input type="number" required {...register('endPage', { required: true })} />
          <FieldError errors={[errors.endPage]} />
        </Field>
        <Field>
          <FieldLabel>cookies</FieldLabel>
          <Input required {...register('cookies', { required: true })} />
          <FieldError errors={[errors.cookies]} />
        </Field>
        <Button type="submit">获取数据</Button>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          back
        </Button>
      </FieldGroup>
    </form>
  );
}
