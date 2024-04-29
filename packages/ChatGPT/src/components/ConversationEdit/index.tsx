/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-19 12:09:18
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-29 06:47:34
 * @FilePath: /tauri/packages/ChatGPT/src/components/ConversationEdit/index.tsx
 */
import { NewConversation } from '@chatgpt/types/conversation';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { Box, TextField, BoxProps } from '@mui/material';
import { useForm, Resolver } from 'react-hook-form';
import { object, string, number, Input, emoji, integer, nullable } from 'valibot';

const conversationSchema = object({
  title: string(),
  icon: string([emoji()]),
  info: nullable(string()),
  templateId: number([integer()]),
});

export type ConversationForm = Input<typeof conversationSchema>;

const getDefaultValues = (): Partial<NewConversation> => ({});

export interface ConversationEditProps extends Omit<BoxProps, 'component' | 'id' | 'onSubmit'> {
  initialValues?: NewConversation;
  id: string;
  onSubmit: (newConversation: ConversationForm) => Promise<void>;
}
export default function ConversationEdit({ initialValues, id, sx, onSubmit: submit, ...props }: ConversationEditProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConversationForm>({
    resolver: valibotResolver(conversationSchema) as Resolver<ConversationForm, unknown>,
    defaultValues: initialValues ?? getDefaultValues(),
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
        error={!!errors.title?.message}
        helperText={errors.title?.message}
        {...register('title', { required: true })}
        required
        label="Title"
        fullWidth
      />
      {/* todo: conversation change fields */}
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
    </Box>
  );
}
