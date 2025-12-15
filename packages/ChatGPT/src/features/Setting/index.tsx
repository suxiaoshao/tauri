import useSettingKey from '@chatgpt/hooks/useSettingKey';
import { createSettingWindow, openSettingFile, setConfigService } from '@chatgpt/service/config';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { FilePen, Plug, Save, Settings } from 'lucide-react';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { useCallback } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useShallow } from 'zustand/react/shallow';
import { selectConfig, useConfigStore } from './configSlice';
import { ChatGPTConfigSchema, type Config } from './types';
import { Link, Outlet, useMatch } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@chatgpt/components/ui/sidebar';
const appWindow = getCurrentWebviewWindow();

function Setting() {
  const initData = useConfigStore(useShallow(selectConfig));
  const methods = useForm<Config>({
    defaultValues: initData,
    resolver: valibotResolver(ChatGPTConfigSchema),
  });
  const { handleSubmit } = methods;
  const matchGeneral = useMatch('/setting/general');
  const matchAdapter = useMatch('/setting/adapter');

  const onSubmit = handleSubmit(async (data) => {
    await setConfigService({ data });
    await appWindow.close();
  });
  const { t } = useTranslation();
  return (
    <FormProvider {...methods}>
      <SidebarProvider defaultOpen>
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>{t('category')}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={matchGeneral !== null} asChild>
                      <Link to="/setting/general">
                        <Settings />
                        {t('general')}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={matchAdapter !== null} asChild>
                      <Link to="/setting/adapter">
                        <Plug />
                        {t('adapter')}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>{t('actions')}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={onSubmit}>
                      <Save />
                      {t('submit')}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={openSettingFile}>
                      <FilePen />
                      {t('open_setting_file')}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1">
          <Outlet />
        </main>
      </SidebarProvider>
    </FormProvider>
  );
}

function SettingItem() {
  useSettingKey();
  const handleSetting = useCallback(async () => {
    await createSettingWindow();
  }, []);
  const { t } = useTranslation();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton onClick={handleSetting}>
        <Settings />
        <span>{t('settings')}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

Setting.Item = SettingItem;

export default Setting;
