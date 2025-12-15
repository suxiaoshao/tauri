/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2023-09-06 17:14:35
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-19 08:02:13
 * @FilePath: /tauri/packages/ChatGPT/src/features/Conversations/components/FolderItem.tsx
 */
import { type Folder } from '@chatgpt/types/folder';
import ConversationItem from './ConversationItem';
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@chatgpt/components/ui/sidebar';
import { FolderClosed, FolderOpen } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@chatgpt/components/ui/collapsible';
import { useSelected } from '../useSelected';
import { match, P } from 'ts-pattern';
import { SelectedType } from '../types';
import { Link, useMatch } from 'react-router-dom';

export interface FolderItemProps {
  folder: Folder;
  subItem: boolean;
}

export default function FolderItem({ folder, subItem }: FolderItemProps) {
  const matchHome = useMatch('/');
  const [selected] = useSelected();
  const isActive = match([selected, matchHome])
    .with([{ tag: SelectedType.Folder, value: folder.id }, P.nonNullable], () => true)
    .otherwise(() => false);
  const searchParams = new URLSearchParams({
    selectedType: SelectedType.Folder,
    selectedId: folder.id.toString(),
  }).toString();
  const content = (
    <CollapsibleContent>
      <SidebarMenuSub>
        {folder.folders.map((f) => (
          <FolderItem subItem key={f.id} folder={f} />
        ))}
        {folder.conversations.map((c) => (
          <ConversationItem subItem key={c.id} conversation={c} />
        ))}
      </SidebarMenuSub>
    </CollapsibleContent>
  );
  if (subItem) {
    return (
      <Collapsible defaultOpen={false} className="group">
        <SidebarMenuSubItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuSubButton isActive={isActive} asChild>
              <Link replace={matchHome !== null} to={{ pathname: '/', search: searchParams }}>
                <FolderClosed className="[a[data-state=open]>_&]:hidden" />
                <FolderOpen className="[a[data-state=closed]>_&]:hidden" />
                <span>{folder.name}</span>
              </Link>
            </SidebarMenuSubButton>
          </CollapsibleTrigger>
        </SidebarMenuSubItem>
        {content}
      </Collapsible>
    );
  }
  return (
    <Collapsible defaultOpen={false} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton isActive={isActive} asChild>
            <Link replace={matchHome !== null} to={{ pathname: '/', search: searchParams }}>
              <FolderClosed className="group-data-[state=open]/collapsible:hidden" />
              <FolderOpen className="group-data-[state=closed]/collapsible:hidden" />
              <span>{folder.name}</span>
            </Link>
          </SidebarMenuButton>
        </CollapsibleTrigger>
      </SidebarMenuItem>
      {content}
    </Collapsible>
  );
}
