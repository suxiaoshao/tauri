import { getChatData } from '@chatgpt/service/chat/query';
import { ChatData } from '@chatgpt/types/chatData';
import { Conversation } from '@chatgpt/types/conversation';
import { Folder } from '@chatgpt/types/folder';
import { Message } from '@chatgpt/types/message';
import { findConversation, findFolder, getFirstConversation, getNodeId } from '@chatgpt/utils/chatData';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { match } from 'ts-pattern';
import { Enum } from 'types';
import { AppThunkAction, RootState } from '../../app/types';
import { ConversationSliceType, Selected, SelectedType } from './types';

export const conversationSlice = createSlice({
  name: 'menu',
  initialState: {
    value: { conversations: [], folders: [] },
    selected: { tag: SelectedType.None },
  } as ConversationSliceType,
  reducers: {
    setChatData: (state, action: PayloadAction<ChatData>) => {
      state.value = action.payload;
    },
    setSelected: (state, action: PayloadAction<Selected>) => {
      state.selected = action.payload;
    },
    updateMessage: (state, { payload }: PayloadAction<Message>) => {
      const conversation = findConversation(state.value, payload.conversationId);
      if (conversation) {
        const message = conversation.messages.findIndex((m) => m.id === payload.id);
        if (message >= 0) {
          conversation.messages[message] = payload;
        } else {
          conversation.messages.push(payload);
        }
      }
    },
  },
});

export const { setChatData, setSelected, updateMessage } = conversationSlice.actions;

export const selectChatData = (state: RootState) => state.conversation.value;
export const SELECT_FOLDERS = (state: RootState) => state.conversation.value.folders;
export const selectSelected = (
  state: RootState,
): Enum<SelectedType.Conversation, Conversation> | Enum<SelectedType.Folder, Folder> | Enum<SelectedType.None> => {
  return match(state.conversation.selected)
    .with({ tag: SelectedType.Folder }, (selected) => {
      return match(findFolder(state.conversation.value, selected.value))
        .with(null, () => ({ tag: SelectedType.None }) as const)
        .otherwise((folder) => ({ tag: SelectedType.Folder, value: folder }) as const);
    })
    .with({ tag: SelectedType.Conversation }, (selected) => {
      return match(findConversation(state.conversation.value, selected.value))
        .with(null, () => ({ tag: SelectedType.None }) as const)
        .otherwise((conversation) => ({ tag: SelectedType.Conversation, value: conversation }) as const);
    })
    .otherwise(() => ({ tag: SelectedType.None }));
};
export const selectSelectedNodeId = (state: RootState) => getNodeId(state.conversation.selected);
export const selectSelectedFolderId = (state: RootState) => {
  return match(state.conversation.selected)
    .with({ tag: SelectedType.Folder }, (selected) => selected.value)
    .with(
      { tag: SelectedType.Conversation },
      (selected) => findConversation(state.conversation.value, selected.value)?.folderId ?? null,
    )
    .otherwise(() => null);
};

export const conversationReducer = conversationSlice.reducer;

export const fetchConversations = (): AppThunkAction => async (dispatch, getState) => {
  const data = await getChatData();
  dispatch(setChatData(data));
  const oldState = getState().conversation.selected;
  let noneSelected: Selected = { tag: SelectedType.None };
  const firstConversation = getFirstConversation(data);
  if (firstConversation) {
    noneSelected = { value: firstConversation.id, tag: SelectedType.Conversation };
  }

  match(oldState)
    .with({ tag: SelectedType.Folder }, ({ value }) => {
      const folder = findFolder(data, value);
      if (!folder) {
        dispatch(setSelected(noneSelected));
      }
    })
    .with({ tag: SelectedType.Conversation }, ({ value }) => {
      const conversation = findConversation(data, value);
      if (!conversation) {
        dispatch(setSelected(noneSelected));
      }
    })
    .with({ tag: SelectedType.None }, () => {
      dispatch(setSelected(noneSelected));
    })
    .exhaustive();
};
