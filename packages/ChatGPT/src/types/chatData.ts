import { Conversation } from './conversation';
import { Folder } from './folder';

export interface ChatData {
  conversations: Conversation[];
  folders: Folder[];
}
