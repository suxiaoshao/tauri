/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-29 22:15:38
 * @FilePath: /tauri/packages/ChatGPT/src/features/MessagePreview/Success.tsx
 */
import CustomEdit from '@chatgpt/components/CustomEdit';
import type { Content, Message } from '@chatgpt/types/message';
import { getSendContent, getSourceContent } from '@chatgpt/utils/content';
import { Edit, Preview, Upload } from '@mui/icons-material';
import { Box, FormLabel, IconButton, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { match } from 'ts-pattern';
const appWindow = getCurrentWebviewWindow();

export interface SuccessProps {
  message: Pick<Message, 'content'>;
  updateMessageContent: (content: Content) => Promise<void>;
}
export enum Alignment {
  preview = 'preview',
  edit = 'edit',
}

export default function Success({ message, updateMessageContent }: SuccessProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const handleAlignment = useCallback(
    (event: React.MouseEvent<HTMLElement>, newAlignment: string | null) => {
      if (newAlignment !== null) {
        setSearchParams((prev) => {
          prev.set('action', newAlignment);
          return prev;
        });
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
  const [code, setCode] = useState<Content>(message.content);
  const handleSubmit = useCallback(async () => {
    try {
      setSubmitLoading(true);
      await updateMessageContent(code);
      appWindow.close();
    } finally {
      setSubmitLoading(false);
    }
  }, [code, updateMessageContent]);

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
      {match(code)
        .with({ tag: 'text' }, ({ value }) => (
          <CustomEdit
            sx={{ width: '100%', height: '100%', borderRadius: (theme) => theme.spacing(1), overflow: 'hidden' }}
            value={match(toggleValue)
              .with(Alignment.preview, () => getSourceContent(message.content))
              .with(Alignment.edit, () => value)
              .exhaustive()}
            readonly={toggleValue === Alignment.preview}
            language="markdown"
            onChange={(newValue) => {
              setCode({
                tag: 'text',
                value: newValue,
              });
            }}
          />
        ))
        .with({ tag: 'extension' }, ({ value: { content, source } }) => (
          <Box sx={{ width: '100%', height: '100%', display: 'flex', gap: 1 }}>
            <Box sx={{ flex: '1 1 0', display: 'flex', flexDirection: 'column' }}>
              <FormLabel>Source</FormLabel>
              <CustomEdit
                sx={{ flex: '1 1 0', borderRadius: (theme) => theme.spacing(1), overflow: 'hidden' }}
                value={match(toggleValue)
                  .with(Alignment.preview, () => getSourceContent(message.content))
                  .with(Alignment.edit, () => source)
                  .exhaustive()}
                readonly={toggleValue === Alignment.preview}
                language="markdown"
                onChange={(newValue) => {
                  setCode((oldValue) => {
                    return match(oldValue)
                      .with(
                        { tag: 'extension' },
                        ({ value: { content, extensionName } }) =>
                          ({
                            tag: 'extension',
                            value: {
                              content,
                              extensionName,
                              source: newValue,
                            },
                          }) satisfies Content,
                      )
                      .with({ tag: 'text' }, () => oldValue)
                      .exhaustive();
                  });
                }}
              />
            </Box>
            <Box sx={{ flex: '1 1 0', display: 'flex', flexDirection: 'column' }}>
              <FormLabel>Send Content</FormLabel>
              <CustomEdit
                sx={{ flex: '1 1 0', borderRadius: (theme) => theme.spacing(1), overflow: 'hidden' }}
                value={match(toggleValue)
                  .with(Alignment.preview, () => getSendContent(message.content))
                  .with(Alignment.edit, () => content)
                  .exhaustive()}
                readonly={toggleValue === Alignment.preview}
                language="markdown"
                onChange={(newValue) => {
                  setCode((oldValue) => {
                    return match(oldValue)
                      .with(
                        { tag: 'extension' },
                        ({ value: { source, extensionName } }) =>
                          ({
                            tag: 'extension',
                            value: {
                              source,
                              extensionName,
                              content: newValue,
                            },
                          }) satisfies Content,
                      )
                      .otherwise(() => oldValue);
                  });
                }}
              />
            </Box>
          </Box>
        ))
        .exhaustive()}
    </Box>
  );
}
