/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao 48886207+suxiaoshao@users.noreply.github.com
 * @LastEditTime: 2024-10-07 10:24:14
 * @FilePath: /tauri/packages/ChatGPT/src/components/AppDrawer/index.tsx
 */
import AddConversation from '@chatgpt/features/Adds/AddConversation';
import AddFolder from '@chatgpt/features/Adds/AddFolder';
import ConversationTree from '@chatgpt/features/Conversations';
import Search from '@chatgpt/features/Search';
import Setting from '@chatgpt/features/Setting';
import ConversationTemplateList from '@chatgpt/features/Template/List';
import usePlatform from '@chatgpt/hooks/usePlatform';
import { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { match } from 'ts-pattern';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable';
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarProvider,
} from '../ui/sidebar';
import { useTranslation } from 'react-i18next';

export default function AppDrawer() {
  const platform = usePlatform();
  const headersHeight = useMemo(() => {
    return match(platform)
      .with('macos', () => '28px')
      .otherwise(() => '0px');
  }, [platform]);
  const { t } = useTranslation();
  return (
    <SidebarProvider className="size-full" defaultOpen={false}>
      <ResizablePanelGroup direction="horizontal" className="size-full bg-transparent flex-1">
        <ResizablePanel defaultSize={33}>
          <SidebarContent className="size-full bg-transparent overflow-y-hidden flex flex-col" data-tauri-drag-region>
            {/* @ts-expect-error css variables */}
            <div className="h-(--headersHeight)" style={{ '--headersHeight': headersHeight }} data-tauri-drag-region />
            <SidebarGroup className="flex-[1_auto_o] w-full overflow-hidden">
              <SidebarGroupLabel>{t('conversation_tree')}</SidebarGroupLabel>
              <ConversationTree />
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>{t('actions')}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {/* eslint-disable-next-line label-has-associated-control */}
                  <AddConversation.Item />
                  {/* eslint-disable-next-line label-has-associated-control */}
                  <AddFolder.Item />
                  {/* eslint-disable-next-line label-has-associated-control */}
                  <ConversationTemplateList.Item />
                  {/* eslint-disable-next-line label-has-associated-control */}
                  <Setting.Item />
                  <Search />
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>
          <Outlet />
        </ResizablePanel>
      </ResizablePanelGroup>
    </SidebarProvider>
  );
}
