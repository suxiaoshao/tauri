/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-28 20:59:49
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 03:19:24
 * @FilePath: /tauri/packages/ChatGPT/src/features/Template/List/index.tsx
 */
import { useMemo } from 'react';
import { Link, useLocation, useMatch } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import TemplateInfo from '../components/TemplateInfo';
import { selectTemplates, useTemplateStore } from '../templateSlice';
import TemplateListHeader from './components/Header';
import { useTranslation } from 'react-i18next';
import { SidebarMenuButton, SidebarMenuItem } from '@chatgpt/components/ui/sidebar';
import { match, P } from 'ts-pattern';
import { LayoutTemplate } from 'lucide-react';
import { Item, ItemContent, ItemGroup, ItemMedia, ItemTitle } from '@chatgpt/components/ui/item';
import { Avatar, AvatarFallback } from '@chatgpt/components/ui/avatar';

function ConversationTemplateList() {
  const templates = useTemplateStore(useShallow(selectTemplates));
  const content = useMemo(
    () => (
      <ItemGroup className="flex-[1_1_o] overflow-y-auto">
        {templates.map(({ id, icon, description, mode, name }) => (
          <Item key={id} asChild>
            <Link to={`/template/${id}`}>
              <ItemMedia>
                <Avatar>
                  <AvatarFallback className="bg-transparent">{icon}</AvatarFallback>
                </Avatar>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>
                  {name} <TemplateInfo description={description} mode={mode} />
                </ItemTitle>
              </ItemContent>
            </Link>
          </Item>
        ))}
      </ItemGroup>
    ),
    [templates],
  );
  return (
    <div className="size-full flex flex-col">
      <TemplateListHeader />
      {content}
    </div>
  );
}

function TemplateItem() {
  const pathname = useLocation().pathname;
  const matchAdd = useMatch('/template');
  const isMatch = useMemo(() => pathname.startsWith('/template'), [pathname]);
  const { t } = useTranslation();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isMatch}>
        <Link
          to={match(matchAdd)
            .with(P.nonNullable, () => '/')
            .otherwise(() => '/template')}
        >
          <LayoutTemplate />
          <span>{t('template')}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

ConversationTemplateList.Item = TemplateItem;

export default ConversationTemplateList;
