/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-01-29 21:03:59
 * @FilePath: /tauri/packages/ChatGPT/src/components/FolderEdit/index.tsx
 */
import { NewFolder } from '@chatgpt/types/folder';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { Box, TextField, BoxProps } from '@mui/material';
import { useForm, Resolver } from 'react-hook-form';
import { object, string, Input } from 'valibot';

const folderSchema = object({ name: string() });

export type FolderForm = Input<typeof folderSchema>;

const DefaultValues: Partial<NewFolder> = {};

export interface FolderEditProps extends Omit<BoxProps, 'component' | 'id' | 'onSubmit'> {
  initialValues?: NewFolder;
  id: string;
  onSubmit: (newFolder: FolderForm) => Promise<void>;
}
export default function FolderEdit({ initialValues, id, sx, onSubmit: submit, ...props }: FolderEditProps) {
  const {
    register,
    handleSubmit,
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
    </Box>
  );
}
