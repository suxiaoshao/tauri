import { Selected, SelectedType } from '@chatgpt/features/Conversations/conversationSlice';
import { ChatData } from '@chatgpt/types/chatData';
import { Conversation } from '@chatgpt/types/conversation';
import { Folder } from '@chatgpt/types/folder';

export function findConversation(chatData: ChatData, conversationId: number | null): Conversation | null {
  const conversation = find(chatData.conversations, conversationId);
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

export function firstConversation(chatData: ChatData): Conversation | null {
  const conversation = chatData.conversations.at(0);
  if (conversation) {
    return conversation ?? null;
  }
  for (const folder of chatData.folders) {
    const conversation = firstConversation(folder);
    if (conversation) {
      return conversation;
    }
  }
  return null;
}

function find(conversations: Conversation[], conversationId: number | null): Conversation | null {
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
