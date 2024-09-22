/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-19 12:09:18
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 03:52:35
 * @FilePath: /tauri/packages/ChatGPT/src/components/ConversationEdit/index.tsx
 */
import { useAppSelector } from '@chatgpt/app/hooks';
import TemplateInfo from '@chatgpt/features/Template/components/TemplateInfo';
import { selectTemplates } from '@chatgpt/features/Template/templateSlice';
import { NewConversation } from '@chatgpt/types/conversation';
import { valibotResolver } from '@hookform/resolvers/valibot';
import {
  Box,
  TextField,
  BoxProps,
  MenuItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  ListItem,
  FormLabel,
} from '@mui/material';
import { useForm, Resolver, Controller } from 'react-hook-form';
import { object, string, number, InferOutput, emoji, integer, nullish, pipe } from 'valibot';
import FolderSelect from '../FolderSelect';

const conversationSchema = object({
  title: string(),
  icon: pipe(string(), emoji()),
  info: nullish(string()),
  templateId: pipe(number(), integer()),
  folderId: nullish(pipe(number(), integer())),
});

export type ConversationForm = InferOutput<typeof conversationSchema>;

const getDefaultValues = (): Partial<NewConversation> => ({
  folderId: null,
});

export interface ConversationEditProps extends Omit<BoxProps<'form'>, 'component' | 'id' | 'onSubmit'> {
  initialValues?: NewConversation;
  id: string;
  onSubmit: (newConversation: ConversationForm) => Promise<void>;
}
export default function ConversationEdit({ initialValues, id, sx, onSubmit: submit, ...props }: ConversationEditProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ConversationForm>({
    resolver: valibotResolver(conversationSchema) as Resolver<ConversationForm, unknown>,
    defaultValues: initialValues ?? getDefaultValues(),
  });
  const onSubmit = handleSubmit(submit);
  const templates = useAppSelector(selectTemplates);
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
        error={!!errors.title?.message}
        helperText={errors.title?.message}
        {...register('title', { required: true })}
        required
        label="Title"
        fullWidth
      />
      <TextField
        error={!!errors.icon?.message}
        helperText={errors.icon?.message}
        label="Icon"
        required
        {...register('icon', { required: true })}
        fullWidth
        sx={{ mt: 2 }}
      />
      <TextField
        error={!!errors.info?.message}
        helperText={errors.info?.message}
        {...register('info')}
        label="Info"
        fullWidth
        sx={{ mt: 2 }}
      />
      <Controller
        control={control}
        name="templateId"
        rules={{ required: true }}
        render={({ field, fieldState }) => (
          <TextField
            error={!!fieldState?.error?.message}
            helperText={fieldState?.error?.message}
            select
            label="Model"
            required
            fullWidth
            sx={{
              mt: 2,
            }}
            SelectProps={{
              MenuProps: {
                sx: {
                  '& .MuiMenu-paper': {
                    backgroundColor: (theme) => theme.palette.background.paper + 'a0',
                    backdropFilter: 'blur(20px)',
                  },
                },
              },
            }}
            {...field}
          >
            {templates.map(({ id, name, icon, description, mode }) => (
              <MenuItem key={id} value={id}>
                <ListItem dense sx={{ p: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'transparent' }}>{icon}</Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={name} secondary={<TemplateInfo description={description} mode={mode} />} />
                </ListItem>
              </MenuItem>
            ))}
          </TextField>
        )}
      />
      <FormLabel sx={{ mt: 2 }}>Folder</FormLabel>
      <Controller control={control} name="folderId" render={({ field }) => <FolderSelect {...field} />} />
    </Box>
  );
}
