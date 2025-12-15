/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-29 03:09:23
 * @FilePath: /tauri/packages/ChatGPT/src/features/Adds/AddFolder.tsx
 */
import FolderEdit, { type FolderForm } from '@chatgpt/components/FolderEdit';
import { Button } from '@chatgpt/components/ui/button';
import { SidebarMenuButton, SidebarMenuItem } from '@chatgpt/components/ui/sidebar';
import { addFolder } from '@chatgpt/service/chat/mutation';
import { type NewFolder } from '@chatgpt/types/folder';
import { ArrowLeft, Plus, Upload } from 'lucide-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useMatch, useNavigate } from 'react-router-dom';

function AddFolder() {
  const navigate = useNavigate();
  const handleSubmit = useCallback(
    async ({ name, ...data }: FolderForm) => {
      await addFolder({
        folder: {
          ...data,
          name: name.trim(),
        } satisfies NewFolder,
      });
      navigate('/');
    },
    [navigate],
  );
  const { t } = useTranslation();
  return (
    <div className="size-full flex flex-col overflow-y-auto">
      <div className="shadow flex items-center gap-2 h-14" data-tauri-drag-region>
        <Button size="icon" variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </Button>
        <span data-tauri-drag-region className="text-xl leading-snug font-medium">
          {t('add_folder')}
        </span>
        <div className="grow" />
        <Button size="icon" variant="ghost" form="folder-form" type="submit">
          <Upload />
        </Button>
      </div>

      <FolderEdit className="p-4" id="folder-form" onSubmit={handleSubmit} />
    </div>
  );
}

function AddFolderItem() {
  const matchAdd = useMatch('/add/folder');
  const { t } = useTranslation();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={matchAdd !== null}>
        <Link to="/add/folder">
          <Plus />
          <span>{t('add_folder')}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

AddFolder.Item = AddFolderItem;

export default AddFolder;
