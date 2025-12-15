import { useCallback, useEffect, useState } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@http-client/components/ui/command';
import { queryApps, type AppPath } from '@http-client/serviece';
import { open } from '@tauri-apps/plugin-shell';

export default function Home() {
  const [appPath, setAppPath] = useState([] as AppPath[]);
  const fetchData = useCallback(async (path: string) => {
    const data: AppPath[] = await queryApps({ path });
    setAppPath(data);
  }, []);
  useEffect(() => {
    fetchData('');
  }, [fetchData]);

  // search & fucused
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
  useEffect(() => {
    if (inputRef) {
      inputRef.focus();
    }
  }, [inputRef]);
  return (
    <Command className="size-full **:[[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 **:[[cmdk-input]]:h-12 **:[[cmdk-item]]:px-2 **:[[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
      <CommandInput onValueChange={fetchData} ref={setInputRef} placeholder="搜索" />
      <CommandList className="h-full max-h-max">
        <CommandEmpty>应用程序未找到</CommandEmpty>
        <CommandGroup heading="应用程序">
          {appPath.map(({ desc, icon, name, path }) => (
            <CommandItem key={path} value={path} onSelect={(path) => open(path)}>
              {icon}
              <span>{name}</span>
              <span className="text-sm text-secondary">{desc}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
