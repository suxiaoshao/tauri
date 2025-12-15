import TemplateInfo from '@chatgpt/features/Template/components/TemplateInfo';
import { selectTemplates, useTemplateStore } from '@chatgpt/features/Template/templateSlice';
import { initTemporaryConversation } from '@chatgpt/service/temporaryConversation/mutation';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { pinyin } from 'pinyin-pro';
import { useTranslation } from 'react-i18next';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@chatgpt/components/ui/command';

export default function TemporaryList() {
  const navigate = useNavigate();
  // data & dispatch
  const templates = useTemplateStore(useShallow(selectTemplates));

  const handleNavigate = useCallback(
    async (id: number) => {
      await initTemporaryConversation({ templateId: id });
      navigate(`/temporary_conversation/detail`);
    },
    [navigate],
  );

  // search & fucused
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
  useEffect(() => {
    if (inputRef) {
      inputRef.focus();
    }
  }, [inputRef]);

  const { t } = useTranslation();
  return (
    <Command className="size-full **:[[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 **:[[cmdk-input]]:h-12 **:[[cmdk-item]]:px-2 **:[[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
      <CommandInput ref={setInputRef} placeholder={t('search_templates')} />
      <CommandList className="h-full max-h-max">
        <CommandEmpty>{t('template_not_found')}</CommandEmpty>
        <CommandGroup heading={t('templates')}>
          {templates.map(({ name, icon, description, mode, id }) => (
            <CommandItem
              key={id}
              value={String(id)}
              keywords={[
                name,
                pinyin(name, { toneType: 'none', type: 'string', separator: '' }),
                description ?? '',
                pinyin(description ?? '', { toneType: 'none', type: 'string', separator: '' }),
              ]}
              onSelect={(id) => handleNavigate(Number.parseInt(id, 10))}
            >
              {icon}
              <span>{name}</span>
              <TemplateInfo description={description} mode={mode} />
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
