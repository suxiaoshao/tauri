/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-29 02:46:17
 * @FilePath: /tauri/packages/ChatGPT/src/features/Home/FolderDetail/components/ContentList.tsx
 */
import { Avatar, AvatarFallback } from '@chatgpt/components/ui/avatar';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from '@chatgpt/components/ui/item';
import { SelectedType } from '@chatgpt/features/Conversations/types';
import { type Conversation } from '@chatgpt/types/conversation';
import { type Folder } from '@chatgpt/types/folder';
import { Folder as FolderIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface ContentListProps {
  folders: Folder[];
  conversations: Conversation[];
}

export default function ContentList({ folders, conversations }: ContentListProps) {
  return (
    <ItemGroup>
      {folders.map((folder) => (
        <Item key={folder.id} asChild>
          <Link
            replace
            to={{
              search: new URLSearchParams({
                selectedType: SelectedType.Folder,
                selectedId: folder.id.toString(),
              }).toString(),
            }}
          >
            <ItemMedia>
              <Avatar>
                <AvatarFallback className="bg-transparent">
                  <FolderIcon />
                </AvatarFallback>
              </Avatar>
            </ItemMedia>
            <ItemContent className="gap-1">
              <ItemTitle>{folder.name}</ItemTitle>
              <ItemDescription>{folder.path}</ItemDescription>
            </ItemContent>
          </Link>
        </Item>
      ))}
      {conversations.length > 0 && folders.length > 0 && <ItemSeparator />}
      {conversations.map((conversation) => (
        <Item asChild key={conversation.id}>
          <Link
            replace
            to={{
              search: new URLSearchParams({
                selectedType: SelectedType.Conversation,
                selectedId: conversation.id.toString(),
              }).toString(),
            }}
          >
            <ItemMedia>
              <Avatar>
                <AvatarFallback className="bg-transparent">{conversation.icon}</AvatarFallback>
              </Avatar>
            </ItemMedia>
            <ItemContent className="gap-1">
              <ItemTitle>{conversation.title}</ItemTitle>
              {conversation.info && <ItemDescription>{conversation.info}</ItemDescription>}
            </ItemContent>
          </Link>
        </Item>
      ))}
    </ItemGroup>
  );
}
