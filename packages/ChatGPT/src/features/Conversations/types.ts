import { type ChatData } from '@chatgpt/types/chatData';
import { type Enum } from 'types';

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
