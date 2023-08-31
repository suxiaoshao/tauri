import { Conversation } from './conversation';

export interface Folder {
  id: number;
  name: string;
  path: string;
  parentId: number | null;
  createdTime: string; // 这里假设 OffsetDateTime 被表示为字符串
  updatedTime: string; // 同样假设 OffsetDateTime 被表示为字符串
  conversations: Conversation[];
  folders: Folder[];
}

export interface NewFolder {
  name: string;
  parentId: number | null;
}
