import { Conversation } from '@chatgpt/types/conversation';
import { getNodeIdByConversation } from '@chatgpt/utils/chatData';
import { TreeItem } from '@mui/lab';

export interface ConversationItemProps {
  conversation: Conversation;
}

export default function ConversationItem({ conversation }: ConversationItemProps) {
  return <TreeItem nodeId={getNodeIdByConversation(conversation)} label={conversation.title} />;
}
