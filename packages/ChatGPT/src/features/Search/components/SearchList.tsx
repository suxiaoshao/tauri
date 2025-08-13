import { type Conversation } from '@chatgpt/types/conversation';
import { List, ListItemText, ListItemButton, ListItemAvatar, Avatar } from '@mui/material';
import { type ActionDispatch, useCallback, useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { match } from 'ts-pattern';
import type { SearchAction } from './SearchDialog';

import { useSelected } from '@chatgpt/features/Conversations/useSelected';
import { SelectedType } from '@chatgpt/features/Conversations/types';

export interface SearchListProps {
  conversationList: Conversation[];
  selectedIndex: number | null;
  dispatch: ActionDispatch<[SearchAction]>;
  onClose: () => void;
}

export default function SearchList({ conversationList, selectedIndex, dispatch, onClose }: SearchListProps) {
  const [_, setSelected] = useSelected();
  const handleNavigate = useCallback(
    (id: number) => {
      setSelected({ tag: SelectedType.Conversation, value: id });
      onClose();
    },
    [onClose, setSelected],
  );
  // hotkeys
  useHotkeys(
    'up',
    (event) => {
      event.preventDefault();
      dispatch({ tag: 'up' });
    },
    { enableOnFormTags: ['INPUT'] },
    [],
  );
  useHotkeys(
    'down',
    (event) => {
      event.preventDefault();
      dispatch({ tag: 'down' });
    },
    { enableOnFormTags: ['INPUT'] },
    [],
  );
  useHotkeys(
    'enter',
    (event) => {
      event.preventDefault();
      if (selectedIndex !== null) {
        handleNavigate(conversationList[selectedIndex].id);
      }
    },
    { enableOnFormTags: ['INPUT'] },
    [selectedIndex, conversationList, handleNavigate],
  );
  // focus
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (ref) {
      ref?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [ref]);
  return (
    <List dense sx={{ flex: '1 1 0', overflowY: 'auto' }}>
      {conversationList.map(({ id, title, info, icon }, index) => (
        <ListItemButton
          ref={match(selectedIndex)
            .with(index, () => setRef)
            // eslint-disable-next-line no-useless-undefined
            .otherwise(() => undefined)}
          dense
          key={id}
          selected={index === selectedIndex}
          onClick={() => handleNavigate(id)}
        >
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: 'transparent' }}>{icon}</Avatar>
          </ListItemAvatar>
          <ListItemText primary={title} secondary={info} />
        </ListItemButton>
      ))}
    </List>
  );
}
