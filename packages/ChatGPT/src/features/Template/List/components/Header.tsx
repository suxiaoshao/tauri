/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-28 22:32:11
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 01:26:12
 * @FilePath: /tauri/packages/ChatGPT/src/features/Template/List/header.tsx
 */
import { Plus, RefreshCcw } from 'lucide-react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { selectTemplateCount, useTemplateStore } from '../../templateSlice';
import { useTranslation } from 'react-i18next';
import { Button } from '@chatgpt/components/ui/button';

export default function TemplateListHeader() {
  const { count, fetchTemplates } = useTemplateStore(
    useShallow((state) => ({ count: selectTemplateCount(state), fetchTemplates: state.fetchTemplates })),
  );
  const refresh = useCallback(() => {
    fetchTemplates();
  }, [fetchTemplates]);
  const navigate = useNavigate();
  const goToCreate = useCallback(() => {
    navigate('/template/create');
  }, [navigate]);
  const { t } = useTranslation();
  return (
    <div className="w-full flex p-2 justify-center shadow" data-tauri-drag-region>
      <div className="grow flex items-center ml-2 gap-2" data-tauri-drag-region>
        <span className="text-xl leading-snug font-medium" data-tauri-drag-region>
          {t('conversation_templates')}
        </span>
        <span className="text-sm text-accent-foreground" data-tauri-drag-region>
          {count} {t('templates')}
        </span>
      </div>
      <Button variant="ghost" size="icon" onClick={refresh}>
        <RefreshCcw />
      </Button>
      <Button variant="ghost" size="icon" onClick={goToCreate}>
        <Plus />
      </Button>
    </div>
  );
}
