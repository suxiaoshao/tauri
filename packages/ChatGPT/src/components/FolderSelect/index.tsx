import { useAppSelector } from '@chatgpt/app/hooks';
import { SELECT_FOLDERS } from '@chatgpt/features/Conversations/conversationSlice';
import { MenuList, MenuItem, ListItemText } from '@mui/material';
import FolderSelectItem from './FolderSelectItem';
import React, { ForwardedRef, createContext, useMemo } from 'react';

export type FolderSelectContextType = {
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  disabledFolderIds: number[];
};

export const FolderSelectContext = createContext<FolderSelectContextType>({
  selectedId: null,
  onSelect: () => {},
  disabledFolderIds: [],
});

export interface FolderSelectProps {
  value?: number | null;
  onChange: (id: number | null) => void;
  disabledFolderIds?: number[];
}

function FolderSelect(
  { value, onChange, disabledFolderIds = [] }: FolderSelectProps,
  ref: ForwardedRef<HTMLUListElement>,
) {
  const folders = useAppSelector(SELECT_FOLDERS);
  const contextValue = useMemo<FolderSelectContextType>(() => {
    return {
      selectedId: value ?? null,
      onSelect: onChange,
      disabledFolderIds,
    };
  }, [disabledFolderIds, onChange, value]);
  return (
    <FolderSelectContext.Provider value={contextValue}>
      <MenuList ref={ref}>
        <MenuItem selected={value === null} onClick={() => onChange(null)}>
          <ListItemText primary={'root'} secondary={'/'} />
        </MenuItem>

        {folders.map((folder) => (
          <FolderSelectItem key={folder.id} folder={folder} />
        ))}
      </MenuList>
    </FolderSelectContext.Provider>
  );
}

export default React.forwardRef(FolderSelect);
