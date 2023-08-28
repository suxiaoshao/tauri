import { NewFolder } from '@chatgpt/types/folder';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, TextField, BoxProps } from '@mui/material';
import { useForm, Resolver } from 'react-hook-form';
import { object, string, InferType } from 'yup';

const folderSchema = object().shape({
  name: string().required(),
});

export type FolderForm = InferType<typeof folderSchema>;

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
    resolver: yupResolver(folderSchema) as Resolver<FolderForm, unknown>,
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
