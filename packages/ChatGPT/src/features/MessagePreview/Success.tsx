/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-29 22:15:38
 * @FilePath: /tauri/packages/ChatGPT/src/features/MessagePreview/Success.tsx
 */
import CustomEdit from '@chatgpt/components/CustomEdit';
import { Button } from '@chatgpt/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@chatgpt/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@chatgpt/components/ui/tooltip';
import type { Content, Message } from '@chatgpt/types/message';
import { getSendContent, getSourceContent } from '@chatgpt/utils/content';
import { Edit, Eye, Upload } from 'lucide-react';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { match } from 'ts-pattern';
import { FieldLabel, Field } from '@chatgpt/components/ui/field';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@chatgpt/components/ui/resizable';
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
    (newAlignment: string | null) => {
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
  const { t } = useTranslation();
  return (
    <div className="size-full p-4 flex flex-col">
      <div className="flex mb-4 justify-between items-center">
        <ToggleGroup variant="outline" type="single" value={toggleValue} onValueChange={handleAlignment}>
          <ToggleGroupItem value={Alignment.preview}>
            <Eye />
          </ToggleGroupItem>
          <ToggleGroupItem value={Alignment.edit}>
            <Edit />
          </ToggleGroupItem>
        </ToggleGroup>
        {toggleValue === Alignment.edit && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={submitLoading} onClick={handleSubmit}>
                <Upload />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('submit')}</TooltipContent>
          </Tooltip>
        )}
      </div>
      {match(code)
        .with({ tag: 'text' }, ({ value }) => (
          <CustomEdit
            className="size-full rounded-xl overflow-hidden"
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
          <ResizablePanelGroup direction="horizontal" className="size-full">
            <ResizablePanel className="size-full" defaultSize={50}>
              <Field className="size-full">
                <FieldLabel>{t('source')}</FieldLabel>
                <CustomEdit
                  className="h-full rounded-l-xl overflow-hidden"
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
              </Field>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel className="size-full">
              <Field className="size-full">
                <FieldLabel>{t('send_content')}</FieldLabel>
                <CustomEdit
                  className="h-full rounded-r-xl overflow-hidden"
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
              </Field>
            </ResizablePanel>
          </ResizablePanelGroup>
        ))
        .exhaustive()}
    </div>
  );
}
