import { type Conversation } from './conversation';
import { type Folder } from './folder';

export interface ChatData {
  conversations: Conversation[];
  folders: Folder[];
}
