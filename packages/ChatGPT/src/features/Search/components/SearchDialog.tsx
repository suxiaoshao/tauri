import { searchConversation } from '@chatgpt/service/chat/query';
import { useEffect, useReducer } from 'react';
import { type Conversation } from '@chatgpt/types/conversation';
import { type Enum } from 'types';
import { match } from 'ts-pattern';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@chatgpt/components/ui/command';
import { useTranslation } from 'react-i18next';
import { pinyin } from 'pinyin-pro';
import { useMatch, useNavigate } from 'react-router-dom';
import { SelectedType } from '@chatgpt/features/Conversations/types';

export interface SearchDialogProps {
  open: boolean;
  onOpenChange: (b: boolean) => void;
}

interface SearchData {
  conversationList: Conversation[];
}

const initialState: SearchData = {
  conversationList: [],
};

export type SearchAction = Enum<'setConversationList', Conversation[]>;
function reducer(state: SearchData, action: SearchAction): SearchData {
  return match(action)
    .with({ tag: 'setConversationList' }, (action) => {
      return {
        conversationList: action.value,
      };
    })
    .otherwise(() => state);
}

export default function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [{ conversationList }, dispatch] = useReducer(reducer, initialState);
  // search
  const handleSearch = async (searchQuery: string) => {
    const data = await searchConversation({ query: searchQuery });
    dispatch({ tag: 'setConversationList', value: data });
  };
  useEffect(() => {
    (async () => {
      const data = await searchConversation({ query: '' });
      dispatch({ tag: 'setConversationList', value: data });
    })();
  }, []);
  const { t } = useTranslation();

  const matchHome = useMatch('/');
  const navigate = useNavigate();

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput onValueChange={handleSearch} spellCheck={false} placeholder={t('search_conversation')} />
      <CommandList>
        <CommandEmpty>{t('conversation_not_found')}</CommandEmpty>
        <CommandGroup heading={t('conversation')}>
          {conversationList.map(({ id, title, icon }) => (
            <CommandItem
              key={id}
              value={String(id)}
              keywords={[title, pinyin(title, { toneType: 'none', type: 'string', separator: '' })]}
              onSelect={(id) => {
                navigate(
                  {
                    pathname: '/',
                    search: new URLSearchParams({
                      selectedType: SelectedType.Conversation,
                      selectedId: id.toString(),
                    }).toString(),
                  },
                  { replace: matchHome !== null },
                );
                onOpenChange(false);
              }}
            >
              {icon}
              <span>{title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
