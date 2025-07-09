import { useSearchParams } from 'react-router-dom';
import { match, P } from 'ts-pattern';
import { type Selected, SelectedType } from './types';
import { useConversationStore } from './conversationSlice';
import { useShallow } from 'zustand/react/shallow';
import { findConversation, findFolder, getFirstConversation } from '@chatgpt/utils/chatData';
import { useCallback, useEffect, useMemo } from 'react';

export function useSelected() {
  const [searchParams, setSearchParams] = useSearchParams();
  const conversations = useConversationStore(useShallow((state) => state.value));
  const noneSelected = useMemo<Selected>(
    () =>
      match(getFirstConversation(conversations))
        .with(P.nonNullable, ({ id }) => ({ tag: SelectedType.Conversation, value: id }) as const)
        .otherwise(() => ({ tag: SelectedType.None }) as const),
    [conversations],
  );
  const selectedType = searchParams.get('selectedType');
  const selectedId = searchParams.get('selectedId');
  const selected = useMemo<Selected>(
    () =>
      match([selectedType, Number.parseInt(selectedId ?? '', 10)])
        .with(
          [SelectedType.Conversation, P.not(Number.NaN)],
          ([_, id]) =>
            ({
              tag: SelectedType.Conversation,
              value: id,
            }) as const,
        )
        .with(
          [SelectedType.Folder, P.not(Number.NaN)],
          ([_, id]) =>
            ({
              tag: SelectedType.Folder,
              value: id,
            }) as const,
        )
        .otherwise(() => ({ tag: SelectedType.None })),
    [selectedType, selectedId],
  );
  const setSelected = useCallback(
    (selected: Selected) => {
      setSearchParams((oldUrlSearchParams) => {
        oldUrlSearchParams.set('selectedType', selected.tag);
        match(selected)
          .with({ tag: SelectedType.Conversation }, ({ value }) => {
            oldUrlSearchParams.set('selectedId', value.toString());
          })
          .with({ tag: SelectedType.Folder }, ({ value }) => {
            oldUrlSearchParams.set('selectedId', value.toString());
          })
          .with({ tag: SelectedType.None }, () => {
            oldUrlSearchParams.delete('selectedId');
          });
        return oldUrlSearchParams;
      });
    },
    [setSearchParams],
  );
  useEffect(() => {
    match(selected)
      .with({ tag: SelectedType.Conversation }, ({ value }) => {
        match(findConversation(conversations, value)).with(P.nullish, () => {
          setSelected(noneSelected);
        });
      })
      .with({ tag: SelectedType.Folder }, ({ value }) => {
        match(findFolder(conversations, value)).with(P.nullish, () => {
          setSelected(noneSelected);
        });
      })
      .with({ tag: SelectedType.None }, () => {
        match(noneSelected).with(P.nonNullable, () => {
          setSelected(noneSelected);
        });
      });
  }, [selected, noneSelected, conversations, setSelected]);
  return [selected, setSelected] as const;
}
