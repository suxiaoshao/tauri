import { useExtensionStore } from '@chatgpt/features/Extensions/extensionSlice';
import { type PromiseData, PromiseStatus } from '@chatgpt/hooks/usePromise';
import { Send } from '@mui/icons-material';
import { IconButton, InputBase, MenuItem, Paper, Select } from '@mui/material';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';
import { match, P } from 'ts-pattern';
import { type InferInput, nullable, object, string } from 'valibot';
import { useShallow } from 'zustand/react/shallow';

const sendMessageSchema = object({
  content: string(),
  extensionName: nullable(string()),
});

type SendMessageInput = InferInput<typeof sendMessageSchema>;

export interface ChatFormProps {
  status: PromiseData<void>;
  onSendMessage: (content: string, extensionName: string | null) => Promise<void>;
}

export default function ChatForm({ status, onSendMessage }: ChatFormProps) {
  const { register, handleSubmit, resetField } = useForm<SendMessageInput>();
  const allExtensions = useExtensionStore(useShallow((value) => value.value));
  const onSubmit = handleSubmit(async ({ content, extensionName }) => {
    resetField('content');
    await onSendMessage(
      content,
      match(extensionName)
        .with(P.string.length(0), () => null)
        .otherwise(() => extensionName),
    );
  });
  const isLoading = [PromiseStatus.loading].includes(status.tag);
  // search & fucused
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);

  // shift + enter
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' && event.shiftKey) {
        event.preventDefault();
        onSubmit();
      }
    },
    [onSubmit],
  );
  useHotkeys(
    'enter',
    (event) => {
      event.preventDefault();
      inputRef?.focus();
    },
    {},
    [inputRef],
  );
  const { t } = useTranslation();
  return (
    <Paper
      onSubmit={onSubmit}
      component="form"
      sx={{
        p: '2px 4px',
        display: 'flex',
        alignItems: 'flex-end',
        width: (theme) => `calc(100% - ${theme.spacing(4)})`,
        flex: '0 0 auto',
        borderRadius: 2,
        m: 2,
        mt: 0,
        backgroundColor: 'transparent',
      }}
      elevation={3}
    >
      <Select size="small" label="Extension" {...register('extensionName')}>
        <MenuItem value="">
          <em>{t('none')}</em>
        </MenuItem>
        {allExtensions.map((extension) => (
          <MenuItem key={extension.name} value={extension.name}>
            {extension.name}
          </MenuItem>
        ))}
      </Select>
      <InputBase
        sx={{ ml: 1, flex: 1, marginBottom: '4px' }}
        placeholder={t('send_message')}
        multiline
        maxRows={4}
        inputRef={setInputRef}
        onKeyDown={handleKeyDown}
        {...register('content')}
      />

      <IconButton type="submit" color="primary" sx={{ p: '10px' }} disabled={isLoading}>
        <Send />
      </IconButton>
    </Paper>
  );
}
