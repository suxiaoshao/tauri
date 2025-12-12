/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2023-09-06 17:14:35
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-19 04:07:38
 * @FilePath: /tauri/packages/ChatGPT/src/features/Conversations/components/ConversationItem.tsx
 */
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@chatgpt/components/ui/sidebar';
import { type Conversation } from '@chatgpt/types/conversation';
import { useSelected } from '../useSelected';
import { match, P } from 'ts-pattern';
import { SelectedType } from '../types';
import { Link, useMatch } from 'react-router-dom';

export interface ConversationItemProps {
  conversation: Conversation;
  subItem: boolean;
}

export default function ConversationItem({ conversation, subItem }: ConversationItemProps) {
  const matchHome = useMatch('/');
  const [selected] = useSelected();
  const isActive = match([selected, matchHome] as const)
    .with([{ tag: SelectedType.Conversation, value: conversation.id }, P.nonNullable], () => true)
    .otherwise(() => false);
  const searchParams = new URLSearchParams({
    selectedType: SelectedType.Conversation,
    selectedId: conversation.id.toString(),
  }).toString();
  if (subItem) {
    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton asChild isActive={isActive}>
          <Link replace={matchHome !== null} to={{ pathname: '/', search: searchParams }}>
            {conversation.icon}
            <span>{conversation.title}</span>
            <span>{conversation.info}</span>
          </Link>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  }
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link replace={matchHome !== null} to={{ pathname: '/', search: searchParams }}>
          {conversation.icon}
          <span>{conversation.title}</span>
          <span>{conversation.info}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
