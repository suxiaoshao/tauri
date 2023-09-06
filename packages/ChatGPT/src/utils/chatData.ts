import { Selected, SelectedType } from '@chatgpt/features/Conversations/conversationSlice';
import { ChatData } from '@chatgpt/types/chatData';
import { Conversation } from '@chatgpt/types/conversation';
import { Folder } from '@chatgpt/types/folder';

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

export function getNodeId(node: Selected): string {
  return `${node.tag}-${node.value}`;
}

export function getNodeIdByConversation(conversation: Conversation): string {
  return getNodeId({ tag: SelectedType.Conversation, value: conversation.id });
}

export function getNodeIdByFolder(folder: Folder): string {
  return getNodeId({ tag: SelectedType.Folder, value: folder.id });
}

export function getSelectedFromNodeId(nodeId: string): Selected {
  const [tag, value] = nodeId.split('-');
  switch (tag) {
    case SelectedType.Conversation:
      return { tag: SelectedType.Conversation, value: parseInt(value) };
    case SelectedType.Folder:
      return { tag: SelectedType.Folder, value: parseInt(value) };
    default:
      return { tag: SelectedType.None };
  }
}
