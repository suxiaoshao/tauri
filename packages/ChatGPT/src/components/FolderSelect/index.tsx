import { SELECT_FOLDERS, useConversationStore } from '@chatgpt/features/Conversations/conversationSlice';
import { ListItemText, MenuItem, MenuList } from '@mui/material';
import { type ForwardedRef, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { type FolderSelectContextType, FolderSelectContext } from './FolderSelectContext';
import FolderSelectItem from './FolderSelectItem';
import { useTranslation } from 'react-i18next';

export interface FolderSelectProps {
  value?: number | null;
  onChange: (id: number | null) => void;
  disabledFolderIds?: number[];
  ref: ForwardedRef<HTMLUListElement>;
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
      <MenuList ref={ref}>
        <MenuItem selected={value === null} onClick={() => onChange(null)}>
          <ListItemText primary={t('root')} secondary="/" />
        </MenuItem>

        {folders.map((folder) => (
          <FolderSelectItem key={folder.id} folder={folder} />
        ))}
      </MenuList>
    </FolderSelectContext.Provider>
  );
}

export default FolderSelect;
