import { Folder } from '@chatgpt/types/folder';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Collapse, ListItemText, MenuItem } from '@mui/material';
import { useCallback, useContext, useState } from 'react';
import { FolderSelectContext } from '.';

export interface FolderSelectItemProps {
  folder: Folder;
}

export default function FolderSelectItem({ folder }: FolderSelectItemProps) {
  const { selectedId, onSelect } = useContext(FolderSelectContext);
  const [open, setOpen] = useState(false);
  const handleClick = useCallback(() => {
    onSelect(folder.id);
    setOpen((value) => !value);
  }, [folder.id, onSelect]);
  return (
    <>
      <MenuItem selected={selectedId === folder.id} onClick={handleClick}>
        <ListItemText primary={folder.name} secondary={folder.path} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </MenuItem>
      {folder.folders.length > 0 && (
        <Collapse in={open} timeout="auto" unmountOnExit sx={{ pl: 2 }}>
          {folder.folders.map((folder) => (
            <FolderSelectItem key={folder.id} folder={folder} />
          ))}
        </Collapse>
      )}
    </>
  );
}
