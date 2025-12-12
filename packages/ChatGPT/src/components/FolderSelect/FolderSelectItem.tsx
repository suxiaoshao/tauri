import { type Folder } from '@chatgpt/types/folder';
import { useCallback, useContext, useMemo } from 'react';
import { FolderSelectContext } from './FolderSelectContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { SidebarMenuButton, SidebarMenuItem, SidebarMenuSub } from '../ui/sidebar';
import { FolderClosed, FolderOpen } from 'lucide-react';

export interface FolderSelectItemProps {
  folder: Folder;
  disabled?: boolean;
  subItem: boolean;
}

export default function FolderSelectItem({ folder, disabled: parentDisabled, subItem }: FolderSelectItemProps) {
  const { selectedId, onSelect, disabledFolderIds } = useContext(FolderSelectContext);
  const handleClick = useCallback(() => {
    onSelect(folder.id);
  }, [folder.id, onSelect]);
  const disabled = useMemo(
    () => disabledFolderIds.includes(folder.id) || parentDisabled,
    [disabledFolderIds, folder.id, parentDisabled],
  );
  const isActive = selectedId === folder.id;
  const content = (
    <CollapsibleContent>
      <SidebarMenuSub>
        {folder.folders.map((f) => (
          <FolderSelectItem subItem key={f.id} folder={f} />
        ))}
      </SidebarMenuSub>
    </CollapsibleContent>
  );
  if (subItem) {
    return (
      <Collapsible defaultOpen={false} className="group">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton disabled={disabled} isActive={isActive} onClick={handleClick}>
              <FolderClosed className="[button[data-state=open]>_&]:hidden" />
              <FolderOpen className="[button[data-state=closed]>_&]:hidden" />
              <span>{folder.name}</span>
              <span className="text-accent-foreground">{folder.path}</span>
            </SidebarMenuButton>
          </CollapsibleTrigger>
        </SidebarMenuItem>
        {content}
      </Collapsible>
    );
  }
  return (
    <Collapsible defaultOpen={false} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton disabled={disabled} isActive={isActive} onClick={handleClick}>
            <FolderClosed className="group-data-[state=open]/collapsible:hidden" />
            <FolderOpen className="group-data-[state=closed]/collapsible:hidden" />
            <span>{folder.name}</span>
            <span className="text-accent-foreground">{folder.path}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
      </SidebarMenuItem>
      {content}
    </Collapsible>
  );
}
