import { type ChatData } from '@chatgpt/types/chatData';
import { type Conversation } from '@chatgpt/types/conversation';
import { type Folder } from '@chatgpt/types/folder';

export function findConversation(chatData: ChatData, conversationId: number | null): Conversation | null {
  const conversation = _findConversation(chatData.conversations, conversationId);
  if (conversation) {
    return conversation;
  }
  for (const folder of chatData.folders) {
    const conversation = findConversation(folder, conversationId);
    if (conversation) {
      return conversation;
    }
  }
  return null;
}

export function findFolder(chatData: ChatData, folderId: number | null): Folder | null {
  const result = _findFolder(chatData.folders, folderId);
  if (result) {
    return result;
  }
  for (const folderItem of chatData.folders) {
    const folder = findFolder(folderItem, folderId);
    if (folder) {
      return folder;
    }
  }
  return null;
}

function _findFolder(folders: Folder[], folderId: number | null): Folder | null {
  return folders.find((f) => f.id === folderId) ?? null;
}

export function getFirstConversation(chatData: ChatData): Conversation | null {
  const conversation = chatData.conversations.at(0);
  if (conversation) {
    return conversation ?? null;
  }
  for (const folder of chatData.folders) {
    const conversation = getFirstConversation(folder);
    if (conversation) {
      return conversation;
    }
  }
  return null;
}

function _findConversation(conversations: Conversation[], conversationId: number | null): Conversation | null {
  return conversations.find((c) => c.id === conversationId) ?? null;
}
