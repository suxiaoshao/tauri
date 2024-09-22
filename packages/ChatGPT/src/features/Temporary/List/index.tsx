import TemplateInfo from '@chatgpt/features/Template/components/TemplateInfo';
import { selectTemplates, useTemplateStore } from '@chatgpt/features/Template/templateSlice';
import { initTemporaryConversation } from '@chatgpt/service/temporaryConversation';
import { ConversationTemplate } from '@chatgpt/types/conversationTemplate';
import { Avatar, Box, Divider, InputBase, List, ListItemAvatar, ListItemButton, ListItemText } from '@mui/material';
import { useCallback, useEffect, useReducer, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useNavigate } from 'react-router-dom';
import { match } from 'ts-pattern';
import { Enum } from 'types';
import { useShallow } from 'zustand/react/shallow';

interface Data {
  selectedIndex: number | null;
  searchText: string | null;
  sourceTemplates: ConversationTemplate[];
  filteredTemplates: ConversationTemplate[];
}

type Action =
  | Enum<'setSearch', string>
  | Enum<'setSourceTemplates', ConversationTemplate[]>
  | Enum<'up'>
  | Enum<'down'>;

function getFilteredTemplates(
  sourceTemplates: ConversationTemplate[],
  searchText: string | null,
): ConversationTemplate[] {
  if (!searchText) {
    return sourceTemplates;
  }
  const lowerSearchText = searchText.toLowerCase();
  return sourceTemplates.filter(({ name, description }) => {
    return name.toLowerCase().includes(lowerSearchText) || description?.toLowerCase().includes(lowerSearchText);
  });
}

function reducer(state: Data, action: Action): Data {
  return match(action)
    .with({ tag: 'up' }, () => {
      if (state.selectedIndex === null) {
        return state;
      }
      if (state.selectedIndex <= 0) {
        return { ...state, selectedIndex: state.filteredTemplates.length - 1 };
      }
      return { ...state, selectedIndex: state.selectedIndex - 1 };
    })
    .with({ tag: 'down' }, () => {
      if (state.selectedIndex === null) {
        return { ...state, selectedIndex: 0 };
      }
      if (state.selectedIndex >= state.filteredTemplates.length - 1) {
        return { ...state, selectedIndex: 0 };
      }
      return { ...state, selectedIndex: state.selectedIndex + 1 };
    })
    .with({ tag: 'setSearch' }, (action) => {
      return {
        ...state,
        searchText: action.value,
        filteredTemplates: getFilteredTemplates(state.sourceTemplates, action.value),
        selectedIndex: null,
      };
    })
    .with({ tag: 'setSourceTemplates' }, (action) => {
      return {
        ...state,
        sourceTemplates: action.value,
        filteredTemplates: getFilteredTemplates(action.value, state.searchText),
        selectedIndex: null,
      };
    })
    .otherwise(() => state);
}

const initialState: Data = {
  selectedIndex: null,
  searchText: null,
  filteredTemplates: [],
  sourceTemplates: [],
};

export default function TemporaryList() {
  const navigate = useNavigate();
  // data & dispatch
  const templates = useTemplateStore(useShallow(selectTemplates));
  const [{ selectedIndex, filteredTemplates }, dispatch] = useReducer(reducer, initialState);
  useEffect(() => {
    dispatch({ tag: 'setSourceTemplates', value: templates });
  }, [templates]);

  const handleNavigate = useCallback(
    async (id: number) => {
      await initTemporaryConversation({ templateId: id });
      navigate(`/temporary_conversation/${id}`);
    },
    [navigate],
  );

  // hotkeys
  useHotkeys(
    'up',
    (event) => {
      event.preventDefault();
      dispatch({ tag: 'up' });
    },
    { enableOnFormTags: ['INPUT'] },
    [templates],
  );
  useHotkeys(
    'down',
    (event) => {
      event.preventDefault();
      dispatch({ tag: 'down' });
    },
    { enableOnFormTags: ['INPUT'] },
    [templates],
  );
  useHotkeys(
    'enter',
    (event) => {
      event.preventDefault();
      if (selectedIndex !== null) {
        handleNavigate(filteredTemplates[selectedIndex].id);
      }
    },
    { enableOnFormTags: ['INPUT'] },
    [selectedIndex, filteredTemplates, handleNavigate],
  );
  const handleClick = useCallback(
    (index: number) => {
      handleNavigate(filteredTemplates[index].id);
    },
    [handleNavigate, filteredTemplates],
  );

  // search & fucused
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
  useEffect(() => {
    if (inputRef) {
      inputRef.focus();
    }
  }, [inputRef]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchText = event.target.value;
    dispatch({ tag: 'setSearch', value: searchText });
  };
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
        onChange={handleSearch}
      />
      <Divider />
      <List dense sx={{ flex: '1 1 0' }}>
        {filteredTemplates.map(({ id, icon, name, description, mode }, index) => (
          <ListItemButton dense selected={index === selectedIndex} key={id} onClick={() => handleClick(index)}>
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
