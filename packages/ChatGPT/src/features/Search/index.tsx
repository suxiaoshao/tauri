import { Search as SearchIcon } from 'lucide-react';
import useSearchKey from './useSearchKey';
import SearchDialog from './components/SearchDialog';
import { useTranslation } from 'react-i18next';
import { SidebarMenuButton, SidebarMenuItem } from '@chatgpt/components/ui/sidebar';
import { useBoolean } from '@chatgpt/hooks/use-boolean';

export default function Search() {
  // dialog
  const [open, { set, setTrue, toggle }] = useBoolean(false);

  // hotkeys
  useSearchKey(toggle);

  const { t } = useTranslation();

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton onClick={setTrue}>
          <SearchIcon />
          <span>{t('search_conversation')}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SearchDialog open={open} onOpenChange={set} />
    </>
  );
}
