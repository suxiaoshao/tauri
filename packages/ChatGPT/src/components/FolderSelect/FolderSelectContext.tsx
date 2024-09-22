import { createContext } from 'react';

export interface FolderSelectContextType {
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  disabledFolderIds: number[];
}

export const FolderSelectContext = createContext<FolderSelectContextType>({
  selectedId: null,
  // eslint-disable-next-line no-empty-function
  onSelect: () => {},
  disabledFolderIds: [],
});
