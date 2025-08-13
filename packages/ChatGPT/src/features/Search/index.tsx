import { Search as SearchIcon } from '@mui/icons-material';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useCallback, useState } from 'react';
import useSearchKey from './useSearchKey';
import SearchDialog from './components/SearchDialog';

export default function Search() {
  // dialog
  const [open, setOpen] = useState(false);
  const handleSearch = useCallback(() => setOpen((value) => !value), []);
  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = () => setOpen(false);

  // hotkeys
  useSearchKey(handleSearch);

  return (
    <>
      <ListItemButton onClick={handleOpen}>
        <ListItemIcon>
          <SearchIcon />
        </ListItemIcon>
        <ListItemText primary="Search Conversation" />
      </ListItemButton>
      <SearchDialog open={open} onClose={handleClose} />
    </>
  );
}
