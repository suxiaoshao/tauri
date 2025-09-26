import { Search as SearchIcon } from '@mui/icons-material';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useCallback, useState } from 'react';
import useSearchKey from './useSearchKey';
import SearchDialog from './components/SearchDialog';
import { useTranslation } from 'react-i18next';

export default function Search() {
  // dialog
  const [open, setOpen] = useState(false);
  const handleSearch = useCallback(() => setOpen((value) => !value), []);
  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = () => setOpen(false);

  // hotkeys
  useSearchKey(handleSearch);

  const { t } = useTranslation();

  return (
    <>
      <ListItemButton onClick={handleOpen}>
        <ListItemIcon>
          <SearchIcon />
        </ListItemIcon>
        <ListItemText primary={t('search_conversation')} />
      </ListItemButton>
      <SearchDialog open={open} onClose={handleClose} />
    </>
  );
}
