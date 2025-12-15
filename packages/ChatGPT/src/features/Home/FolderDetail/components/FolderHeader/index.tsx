import { deleteFolder } from '@chatgpt/service/chat/mutation';
import { type Folder } from '@chatgpt/types/folder';
import { useCallback } from 'react';
import MoveFolder from './MoveFolder';
import UpdateFolder from './UpdateFolder';
import { Button } from '@chatgpt/components/ui/button';
import { Trash } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@chatgpt/components/ui/tooltip';
import { useTranslation } from 'react-i18next';
export interface FolderHeaderProps {
  folder: Folder;
}

export default function FolderHeader({ folder }: FolderHeaderProps) {
  const handleDelete = useCallback(async () => {
    await deleteFolder({ id: folder.id });
  }, [folder.id]);
  const { t } = useTranslation();

  return (
    <div className="w-full flex p-2 justify-center shadow" data-tauri-drag-region>
      <div className="grow flex items-center ml-2 gap-2" data-tauri-drag-region>
        <span className="text-xl" data-tauri-drag-region>
          {folder.name}
        </span>
        <span className="text-sm text-accent-foreground" data-tauri-drag-region>
          {folder.path}
        </span>
      </div>
      <UpdateFolder folder={folder} />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={handleDelete}>
            <Trash />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('delete')}</TooltipContent>
      </Tooltip>
      <MoveFolder folder={folder} />
    </div>
  );
}
