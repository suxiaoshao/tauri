/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-29 22:15:38
 * @FilePath: /tauri/packages/ChatGPT/src/features/MessagePreview/Success.tsx
 */
import CustomEdit from '@chatgpt/components/CustomEdit';
import { updateMessageContent } from '@chatgpt/service/chat/mutation';
import { Message } from '@chatgpt/types/message';
import { Edit, Preview, Upload } from '@mui/icons-material';
import { Box, IconButton, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { appWindow } from '@tauri-apps/api/window';
import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { match } from 'ts-pattern';

export interface SuccessProps {
  message: Message;
}
export enum Alignment {
  preview = 'preview',
  edit = 'edit',
}

export default function Success({ message }: SuccessProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const handleAlignment = useCallback(
    (event: React.MouseEvent<HTMLElement>, newAlignment: string | null) => {
      if (newAlignment !== null) {
        setSearchParams({ action: newAlignment });
      }
    },
    [setSearchParams],
  );
  const toggleValue = useMemo<Alignment>(() => {
    return match(searchParams.get('action'))
      .with(Alignment.preview, () => Alignment.preview)
      .with(Alignment.edit, () => Alignment.edit)
      .otherwise(() => Alignment.preview);
  }, [searchParams]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [code, setCode] = useState<string>(message.content);
  const handleSubmit = useCallback(() => {
    try {
      setSubmitLoading(true);
      updateMessageContent({ id: message.id, content: code });
      appWindow.close();
    } finally {
      setSubmitLoading(false);
    }
  }, [code, message.id]);

  return (
    <Box sx={{ width: '100%', height: '100%', p: 2, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', mb: 2, justifyContent: 'space-between', alignItems: 'center' }}>
        <ToggleButtonGroup value={toggleValue} exclusive onChange={handleAlignment}>
          <ToggleButton value={Alignment.preview}>
            <Preview />
          </ToggleButton>
          <ToggleButton value={Alignment.edit}>
            <Edit />
          </ToggleButton>
        </ToggleButtonGroup>
        {toggleValue === Alignment.edit && (
          <Tooltip title="Submit">
            <IconButton disabled={submitLoading} onClick={handleSubmit} color="primary">
              <Upload />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <CustomEdit
        sx={{ width: '100%', height: '100%', borderRadius: (theme) => theme.spacing(1), overflow: 'hidden' }}
        value={match(toggleValue)
          .with(Alignment.preview, () => message.content)
          .with(Alignment.edit, () => code)
          .exhaustive()}
        readonly={toggleValue === Alignment.preview}
        language="markdown"
        onChange={(newValue) => {
          setCode(newValue);
        }}
      />
    </Box>
  );
}
