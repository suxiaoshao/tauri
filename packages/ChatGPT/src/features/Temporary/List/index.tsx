import { useAppSelector } from '@chatgpt/app/hooks';
import TemplateInfo from '@chatgpt/features/Template/components/TemplateInfo';
import { selectTemplates } from '@chatgpt/features/Template/templateSlice';
import { Avatar, Box, Divider, InputBase, List, ListItemAvatar, ListItemButton, ListItemText } from '@mui/material';
import { useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
export default function TemporaryList() {
  const templates = useAppSelector(selectTemplates);
  const [seletedIndex, setSeletedIndex] = useState<number | null>(null);
  useHotkeys(
    'up',
    (event) => {
      event.preventDefault();
      setSeletedIndex((prev) => {
        if (prev !== null) {
          return prev - 1 < 0 ? 0 : prev - 1;
        }
        return prev;
      });
    },
    { enableOnFormTags: ['INPUT'] },
    [seletedIndex, templates],
  );
  useHotkeys(
    'down',
    (event) => {
      event.preventDefault();
      setSeletedIndex((prev) => {
        if (prev !== null) {
          return prev + 1 >= templates.length ? 0 : prev + 1;
        }
        return 0;
      });
    },
    { enableOnFormTags: ['INPUT'] },
    [seletedIndex, templates],
  );
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
  useEffect(() => {
    if (inputRef) {
      inputRef.focus();
    }
  }, [inputRef]);
  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <InputBase
        sx={{
          flex: '0 0 auto',
          p: 1.5,
          pl: 2,
          pr: 2,
        }}
        placeholder="Search Google Maps"
        inputProps={{ 'aria-label': 'search google maps' }}
        inputRef={setInputRef}
        data-tauri-drag-region
      />
      <Divider />
      <List dense sx={{ flex: '1 1 0' }}>
        {templates.map(({ id, icon, name, description, mode }, index) => (
          <ListItemButton dense selected={index === seletedIndex} key={id}>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: 'transparent' }}>{icon}</Avatar>
            </ListItemAvatar>
            <ListItemText primary={name} secondary={<TemplateInfo description={description} mode={mode} />} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
