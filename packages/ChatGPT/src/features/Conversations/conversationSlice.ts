import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunkAction, RootState } from '../../app/store';
import { Message } from '@chatgpt/types/message';
import { ChatData } from '@chatgpt/types/chatData';
import { findConversation, findFolder, getFirstConversation, getNodeId } from '@chatgpt/utils/chatData';
import { Enum } from 'types';
import { Conversation } from '@chatgpt/types/conversation';
import { Folder } from '@chatgpt/types/folder';
import { getChatData } from '@chatgpt/service/chat/query';

export enum SelectedType {
  Conversation = 'Conversation',
  Folder = 'Folder',
  None = 'None',
}
export type Selected =
  | Enum<SelectedType.Conversation, number>
  | Enum<SelectedType.Folder, number>
  | Enum<SelectedType.None>;

export interface ConversationSliceType {
  value: ChatData;
  selected: Selected;
}

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
  switch (state.conversation.selected.tag) {
    case SelectedType.Folder:
      const folder = findFolder(state.conversation.value, state.conversation.selected.value);
      if (folder) {
        return {
          tag: SelectedType.Folder,
          value: folder,
        };
      }

    case SelectedType.Conversation:
      const conversation = findConversation(state.conversation.value, state.conversation.selected.value);
      if (conversation) {
        return {
          value: conversation,
          tag: SelectedType.Conversation,
        };
      }

    default:
      return {
        tag: SelectedType.None,
      };
  }
};
export const selectSelectedNodeId = (state: RootState) => getNodeId(state.conversation.selected);
export const selectSelectedFolderId = (state: RootState) => {
  switch (state.conversation.selected.tag) {
    case SelectedType.Folder:
      return state.conversation.selected.value;
    case SelectedType.Conversation:
      return findConversation(state.conversation.value, state.conversation.selected.value)?.folderId ?? null;
    default:
      return null;
  }
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
  switch (oldState.tag) {
    case SelectedType.Folder:
      const folder = findFolder(data, oldState.value);
      if (!folder) {
        dispatch(setSelected(noneSelected));
      }
      break;
    case SelectedType.Conversation:
      const conversation = findConversation(data, oldState.value);
      if (!conversation) {
        dispatch(setSelected(noneSelected));
      }
      break;
    case SelectedType.None:
      dispatch(setSelected(noneSelected));
  }
};
