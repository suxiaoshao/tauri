import FolderEdit, { type FolderForm } from '@chatgpt/components/FolderEdit';
import { Button } from '@chatgpt/components/ui/button';
import {
  Dialog,
  DialogFooter,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@chatgpt/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@chatgpt/components/ui/tooltip';
import { useBoolean } from '@chatgpt/hooks/use-boolean';
import { updateFolder } from '@chatgpt/service/chat/mutation';
import { type Folder, type NewFolder } from '@chatgpt/types/folder';
import { Edit as EditIcon } from 'lucide-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export interface FolderHeaderProps {
  folder: Folder;
}

export default function UpdateFolder({ folder }: FolderHeaderProps) {
  const [open, { set, setFalse }] = useBoolean(false);
  const handleSubmit = useCallback(
    async ({ name, parentId }: FolderForm) => {
      await updateFolder({
        folder: { name: name.trim(), parentId: parentId } satisfies NewFolder,
        id: folder.id,
      });
      setFalse();
    },
    [folder.id, setFalse],
  );
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={set}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <EditIcon />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>{t('modify')}</TooltipContent>
      </Tooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('modify_folder')}</DialogTitle>
        </DialogHeader>
        <FolderEdit initialValues={folder} id="folder-form" onSubmit={handleSubmit} />
        <DialogFooter>
          <Button type="submit" form="folder-form">
            {t('save_changes')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
