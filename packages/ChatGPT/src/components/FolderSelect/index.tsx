import { SELECT_FOLDERS, useConversationStore } from '@chatgpt/features/Conversations/conversationSlice';
import { type ForwardedRef, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { type FolderSelectContextType, FolderSelectContext } from './FolderSelectContext';
import FolderSelectItem from './FolderSelectItem';
import { useTranslation } from 'react-i18next';
import { SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../ui/sidebar';

export interface FolderSelectProps {
  value?: number | null;
  onChange: (id: number | null) => void;
  disabledFolderIds?: number[];
  ref: ForwardedRef<HTMLDivElement>;
}

function FolderSelect({ value, onChange, disabledFolderIds = [], ref }: FolderSelectProps) {
  const folders = useConversationStore(useShallow(SELECT_FOLDERS));
  const contextValue = useMemo<FolderSelectContextType>(() => {
    return {
      selectedId: value ?? null,
      onSelect: onChange,
      disabledFolderIds,
    };
  }, [disabledFolderIds, onChange, value]);
  const { t } = useTranslation();
  return (
    <FolderSelectContext.Provider value={contextValue}>
      <SidebarContent ref={ref}>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton type="button" onClick={() => onChange(null)} isActive={value === null}>
                {t('root')}
                <span className="text-accent-foreground">/</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {folders.map((folder) => (
              <FolderSelectItem subItem={false} key={folder.id} folder={folder} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </FolderSelectContext.Provider>
  );
}

export default FolderSelect;
