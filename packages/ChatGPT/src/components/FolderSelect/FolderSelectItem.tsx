import { Folder } from '@chatgpt/types/folder';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Collapse, ListItemText, MenuItem } from '@mui/material';
import { useCallback, useContext, useMemo, useState } from 'react';
import { FolderSelectContext } from './FolderSelectContext';
import { match } from 'ts-pattern';

export interface FolderSelectItemProps {
  folder: Folder;
  disabled?: boolean;
}

export default function FolderSelectItem({ folder, disabled: parentDisabled }: FolderSelectItemProps) {
  const { selectedId, onSelect, disabledFolderIds } = useContext(FolderSelectContext);
  const [open, setOpen] = useState(false);
  const handleClick = useCallback(() => {
    onSelect(folder.id);
    setOpen((value) => !value);
  }, [folder.id, onSelect]);
  const disabled = useMemo(
    () => disabledFolderIds.includes(folder.id) || parentDisabled,
    [disabledFolderIds, folder.id, parentDisabled],
  );
  return (
    <>
      <MenuItem disabled={disabled} selected={selectedId === folder.id} onClick={handleClick}>
        <ListItemText primary={folder.name} secondary={folder.path} />
        {match(open)
          .with(true, () => <ExpandLess />)
          .with(false, () => <ExpandMore />)
          .exhaustive()}
      </MenuItem>
      {folder.folders.length > 0 && (
        <Collapse in={open} timeout="auto" unmountOnExit sx={{ pl: 2 }}>
          {folder.folders.map((folder) => (
            <FolderSelectItem disabled={disabled} key={folder.id} folder={folder} />
          ))}
        </Collapse>
      )}
    </>
  );
}
