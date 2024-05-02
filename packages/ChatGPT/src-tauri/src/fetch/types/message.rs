/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 05:22:51
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/fetch/types/message.rs
 */
use serde::{Deserialize, Serialize};

use crate::store::{ConversationTemplatePrompt, Message as StoreMessage, Mode};
use crate::store::{Role, Status};

#[derive(Debug, Deserialize, Serialize)]
pub struct Message {
    pub role: Role,
    pub content: String,
}

impl Message {
    pub fn from_conversations(
        prompts: Vec<ConversationTemplatePrompt>,
        store_messages: Vec<StoreMessage>,
        mode: Mode,
    ) -> Vec<Self> {
        let mut messages = Self::from_conversation_template_prompt(prompts);
        messages.extend(Self::from_messages(store_messages, mode));
        messages
    }
    fn from_message(
        StoreMessage {
            role,
            content,
            status,
            ..
        }: StoreMessage,
        mode: Mode,
    ) -> Option<Self> {
        match (mode, status, role) {
            (Mode::Contextual, Status::Normal, _) => Some(Self { role, content }),
            (Mode::AssistantOnly, Status::Normal, Role::Assistant) => Some(Self { role, content }),
            _ => None,
        }
    }
    fn from_messages(messages: Vec<StoreMessage>, mode: Mode) -> Vec<Self> {
        match mode {
            Mode::Single => vec![],
            _ => messages
                .into_iter()
                .filter_map(|msg| Self::from_message(msg, mode))
                .collect(),
        }
    }
    fn from_conversation_template_prompt(prompts: Vec<ConversationTemplatePrompt>) -> Vec<Self> {
        prompts
            .into_iter()
            .map(|prompt| Self {
                role: prompt.role,
                content: prompt.prompt,
            })
            .collect()
    }
    pub fn new(role: Role, content: String) -> Self {
        Self { role, content }
    }
}
