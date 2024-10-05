/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-01-29 21:03:59
 * @FilePath: /tauri/packages/ChatGPT/src/components/FolderEdit/index.tsx
 */
import { type NewFolder } from '@chatgpt/types/folder';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { Box, FormLabel, TextField, type BoxProps } from '@mui/material';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { integer, nullish, number, object, pipe, string, type InferInput } from 'valibot';
import FolderSelect from '../FolderSelect';

const folderSchema = object({ name: string(), parentId: nullish(pipe(number(), integer())) });

export type FolderForm = InferInput<typeof folderSchema>;

const DefaultValues: Partial<NewFolder> = {};

export interface FolderEditProps extends Omit<BoxProps<'form'>, 'component' | 'id' | 'onSubmit'> {
  initialValues?: NewFolder;
  id: string;
  onSubmit: (newFolder: FolderForm) => Promise<void>;
}
export default function FolderEdit({ initialValues, id, sx, onSubmit: submit, ...props }: FolderEditProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FolderForm>({
    resolver: valibotResolver(folderSchema) as Resolver<FolderForm, unknown>,
    defaultValues: initialValues ?? DefaultValues,
  });
  const onSubmit = handleSubmit(submit);
  return (
    <Box
      {...props}
      sx={{
        flex: '1 1 0',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflowY: 'auto',
        p: 2,
        ...sx,
      }}
      component="form"
      id={id}
      onSubmit={onSubmit}
    >
      <TextField
        error={!!errors.name?.message}
        helperText={errors.name?.message}
        {...register('name', { required: true })}
        required
        label="Title"
        fullWidth
      />
      <FormLabel sx={{ mt: 2 }}>Folder</FormLabel>
      <Controller control={control} name="parentId" render={({ field }) => <FolderSelect {...field} />} />
    </Box>
  );
}
