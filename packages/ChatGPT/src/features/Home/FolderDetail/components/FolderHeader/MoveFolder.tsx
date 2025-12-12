import FolderSelect from '@chatgpt/components/FolderSelect';
import { Button } from '@chatgpt/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@chatgpt/components/ui/dialog';
import { FieldError, FieldGroup, FieldLabel, Field } from '@chatgpt/components/ui/field';
import { Tooltip, TooltipContent, TooltipTrigger } from '@chatgpt/components/ui/tooltip';
import { useBoolean } from '@chatgpt/hooks/use-boolean';
import { type MoveFolderParams, moveFolder } from '@chatgpt/service/chat/mutation';
import { type Folder } from '@chatgpt/types/folder';
import { FolderInput } from 'lucide-react';
import { useCallback } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export interface MoveFolderProps {
  folder: Folder;
}

export default function MoveFolder({ folder }: MoveFolderProps) {
  const [open, { set, setFalse }] = useBoolean(false);
  const { control, handleSubmit } = useForm<Pick<MoveFolderParams, 'parentId'>>({
    defaultValues: {
      parentId: folder.parentId,
    },
  });
  const onSubmit = useCallback(
    async ({ parentId }: Pick<MoveFolderParams, 'parentId'>) => {
      await moveFolder({ parentId, id: folder.id });
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
              <FolderInput />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>{t('move')}</TooltipContent>
      </Tooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('move_folder')}</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              control={control}
              name="parentId"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>{t('parent_folder')}</FieldLabel>
                  <FolderSelect {...field} disabledFolderIds={[folder.id]} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter>
            <Button type="submit">{t('move')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
