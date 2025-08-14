import { searchConversation } from '@chatgpt/service/chat/query';
import { Dialog, Divider, InputBase } from '@mui/material';
import { useEffect, useReducer, useState } from 'react';
import SearchList from './SearchList';
import { type Conversation } from '@chatgpt/types/conversation';
import { type Enum } from 'types';
import { match } from 'ts-pattern';

export interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

interface SearchData {
  selectedIndex: number | null;
  conversationList: Conversation[];
}

const initialState: SearchData = {
  selectedIndex: null,
  conversationList: [],
};

export type SearchAction = Enum<'setConversationList', Conversation[]> | Enum<'up'> | Enum<'down'>;
function reducer(state: SearchData, action: SearchAction): SearchData {
  return match(action)
    .with({ tag: 'up' }, () => {
      if (state.selectedIndex === null || state.selectedIndex <= 0) {
        return { ...state, selectedIndex: state.conversationList.length - 1 };
      }
      return { ...state, selectedIndex: state.selectedIndex - 1 };
    })
    .with({ tag: 'down' }, () => {
      if (state.selectedIndex === null) {
        return { ...state, selectedIndex: 0 };
      }
      if (state.selectedIndex >= state.conversationList.length - 1) {
        return { ...state, selectedIndex: 0 };
      }
      return { ...state, selectedIndex: state.selectedIndex + 1 };
    })
    .with({ tag: 'setConversationList' }, (action) => {
      return {
        conversationList: action.value,
        selectedIndex: null,
      };
    })
    .otherwise(() => state);
}

export default function SearchDialog({ open, onClose }: SearchDialogProps) {
  const [{ selectedIndex, conversationList }, dispatch] = useReducer(reducer, initialState);
  // search & fucused
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
  useEffect(() => {
    if (inputRef) {
      inputRef.focus();
    }
  }, [inputRef]);

  // search
  const handleSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchQuery = event.target.value;
    const data = await searchConversation({ query: searchQuery });
    dispatch({ tag: 'setConversationList', value: data });
  };
  useEffect(() => {
    (async () => {
      const data = await searchConversation({ query: '' });
      dispatch({ tag: 'setConversationList', value: data });
    })();
  }, []);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          backgroundColor: (theme) => theme.palette.background.paper + 'a0',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          overflow: 'hidden',
          height: '500px',
        },
      }}
    >
      <InputBase
        sx={{
          flex: '0 0 auto',
          p: 1.5,
          pl: 2,
          pr: 2,
        }}
        placeholder="Search Conversations"
        inputProps={{ 'aria-label': 'search conversations', spellCheck: 'false' }}
        inputRef={setInputRef}
        onChange={handleSearch}
      />
      <Divider />
      {conversationList.length > 0 && (
        <SearchList
          conversationList={conversationList}
          selectedIndex={selectedIndex}
          dispatch={dispatch}
          onClose={onClose}
        />
      )}
    </Dialog>
  );
}
