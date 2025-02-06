import { type Enum } from 'types';

export enum SelectedType {
  Conversation = 'conversation',
  Folder = 'folder',
  None = 'none',
}
export type Selected =
  | Enum<SelectedType.Conversation, number>
  | Enum<SelectedType.Folder, number>
  | Enum<SelectedType.None>;
