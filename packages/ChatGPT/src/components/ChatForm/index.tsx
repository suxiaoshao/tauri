import { useExtensionStore } from '@chatgpt/features/Extensions/extensionSlice';
import { type PromiseData, PromiseStatus } from '@chatgpt/hooks/usePromise';
import { Check, ChevronDown, Send } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';
import { match, P } from 'ts-pattern';
import { type InferInput, nullable, object, string } from 'valibot';
import { useShallow } from 'zustand/react/shallow';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { useBoolean } from '@chatgpt/hooks/use-boolean';

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
  const { register, handleSubmit, resetField, control } = useForm<SendMessageInput>();
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
  const [inputRef, setInputRef] = useState<HTMLTextAreaElement | null>(null);

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
  const [open, { set, setFalse }] = useBoolean(false);
  const { ref, ...contentProps } = register('content');
  return (
    <form
      className="p-2 flex flex-col  w-[calc(100%-(--spacing(8)))] grow-0 rounded-2xl m-4 mt-0 shadow-2xl bg-card"
      onSubmit={onSubmit}
    >
      <textarea
        onKeyDown={handleKeyDown}
        ref={(setRef) => {
          if (!setRef) return;
          setInputRef(setRef);
          ref(setRef);
        }}
        {...contentProps}
        rows={3}
        placeholder={t('send_message')}
        className="p-2 appearance-none border-none focus:outline-none resize-none"
      />
      <div className="flex">
        <Controller
          name="extensionName"
          control={control}
          render={({ field }) => (
            <Popover open={open} onOpenChange={set}>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="group">
                  {t('plugin_name', { name: field.value ?? t('none') })}
                  <ChevronDown className="transition-transform ml-auto group-data-[state=open]:rotate-180" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Command>
                  <CommandInput placeholder="Search" className="h-9" />
                  <CommandList>
                    <CommandEmpty>{t('plugin_no_found')}</CommandEmpty>
                    <CommandGroup>
                      {allExtensions.map((extension) => (
                        <CommandItem
                          onSelect={(newValue) => {
                            if (newValue === field.value) {
                              field.onChange(null);
                              setFalse();
                              return;
                            }
                            field.onChange(newValue);
                            setFalse();
                          }}
                          key={extension.name}
                          value={extension.name}
                        >
                          {extension.name}
                          <Check
                            visibility={match(field.value)
                              .with(extension.name, () => 'visible')
                              .otherwise(() => 'hidden')}
                            className="ml-auto"
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        />
        <div className="flex-1" />
        <Button variant="ghost" size="icon" type="submit" disabled={isLoading}>
          <Send />
        </Button>
      </div>
    </form>
  );
}
