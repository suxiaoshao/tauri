import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@hclipboard/components/ui/popover';
import { Button } from '@hclipboard/components/ui/button';
import {
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  Command,
  CommandSeparator,
} from '@hclipboard/components/ui/command';
import { cn } from '@hclipboard/lib/utils';
import { ClipboardType } from '@hclipboard/rpc/query';
import { match, P } from 'ts-pattern';
import { useEffect } from 'react';
import usePlatform from '@chatgpt/hooks/usePlatform';

const clipboardTypes = [
  {
    value: ClipboardType.Text,
    label: 'Text',
  },
  {
    value: ClipboardType.Image,
    label: 'Image',
  },
  {
    value: ClipboardType.Html,
    label: 'HTML',
  },
  {
    value: ClipboardType.Files,
    label: 'Files',
  },
  {
    value: ClipboardType.Rtf,
    label: 'RTF',
  },
];

const patternType = P.union(
  ClipboardType.Files,
  ClipboardType.Text,
  ClipboardType.Image,
  ClipboardType.Html,
  ClipboardType.Rtf,
);

interface TypeSelectProps {
  value: ClipboardType | undefined;
  onChange: (value?: ClipboardType | undefined) => void;
}

export function TypeSelect({ value, onChange }: TypeSelectProps) {
  const [open, setOpen] = React.useState(false);
  const platform = usePlatform();
  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;
    document.addEventListener(
      'keydown',
      (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setOpen(false);
        }
        const isMacos = platform === 'macos';
        if (((event.metaKey && isMacos) || (event.ctrlKey && !isMacos)) && (event.key === 'p' || event.key === 'P')) {
          event.preventDefault();
          event.stopPropagation();
          setOpen((state) => !state);
        }
      },
      { signal },
    );

    return () => {
      abortController.abort();
    };
  }, [platform]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          // oxlint-disable-next-line role-has-required-aria-props
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between items-center"
        >
          {match(value)
            .with(ClipboardType.Files, () => 'Files')
            .with(ClipboardType.Text, () => 'Text')
            .with(ClipboardType.Image, () => 'Image')
            .with(ClipboardType.Html, () => 'HTML')
            .with(ClipboardType.Rtf, () => 'RTF')
            .otherwise(() => 'All Types')}
          <div className="flex gap-1 items-center">
            <span className="text-muted-foreground">
              {match(platform)
                .with('macos', () => '⌘ P')
                .otherwise(() => 'Ctrl P')}
            </span>
            <ChevronsUpDown className="opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search" className="h-9" />
          <CommandList>
            <CommandEmpty>No Types found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onChange();
                  setOpen(false);
                }}
              >
                All Types
                <Check
                  visibility={match(value)
                    .with(P.nullish, () => 'visible')
                    .otherwise(() => 'hidden')}
                  className={cn('ml-auto')}
                />
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              {clipboardTypes.map((type) => (
                <CommandItem
                  key={type.value}
                  value={type.value}
                  onSelect={(currentValue: unknown) => {
                    onChange(
                      match(currentValue)
                        // oxlint-disable-next-line  no-useless-undefined
                        .with(value, () => undefined)
                        .with(patternType, (value) => value)
                        // oxlint-disable-next-line  no-useless-undefined
                        .otherwise(() => undefined),
                    );
                    setOpen(false);
                  }}
                >
                  {type.label}
                  <Check
                    visibility={match(value)
                      .with(type.value, () => 'visible')
                      .otherwise(() => 'hidden')}
                    className={cn('ml-auto')}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
