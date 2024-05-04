import { useAppSelector } from '@chatgpt/app/hooks';
import TemplateInfo from '@chatgpt/features/Template/components/TemplateInfo';
import { selectTemplates } from '@chatgpt/features/Template/templateSlice';
import { Avatar, List, ListItemAvatar, ListItemButton, ListItemText } from '@mui/material';
import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import './index.css';
export default function TemporaryList() {
  const templates = useAppSelector(selectTemplates);
  const [seletedIndex, setSeletedIndex] = useState<number | null>(null);
  const [ref, setRef] = useState<HTMLUListElement | null>(null);
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
    {},
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
    {
      document: document,
    },
    [seletedIndex, templates],
  );
  return (
    <List dense ref={setRef} sx={{ width: '100%', height: '100%', overflowY: 'auto!important' }}>
      {templates.map(({ id, icon, name, description, mode }, index) => (
        <ListItemButton dense selected={index === seletedIndex} key={id}>
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: 'transparent' }}>{icon}</Avatar>
          </ListItemAvatar>
          <ListItemText primary={name} secondary={<TemplateInfo description={description} mode={mode} />} />
        </ListItemButton>
      ))}
    </List>
  );
}
