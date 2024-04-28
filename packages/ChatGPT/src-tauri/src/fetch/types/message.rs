/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-28 07:20:04
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
    pub fn from_conversation(
        StoreMessage {
            role,
            content,
            status,
            ..
        }: StoreMessage,
        mode: Mode,
    ) -> Option<Self> {
        match mode {
            Mode::Contextual => match status {
                crate::store::Status::Normal => Some(Self { role, content }),
                crate::store::Status::Hidden => None,
                Status::Loading => None,
                Status::Error => None,
            },
            Mode::Single => None,
            Mode::AssistantOnly => match (role, status) {
                (Role::Assistant, Status::Normal) => Some(Self { role, content }),
                _ => None,
            },
        }
    }
    pub fn from_messages(messages: Vec<StoreMessage>, mode: Mode) -> Vec<Self> {
        match mode {
            Mode::Single => vec![],
            _ => messages
                .into_iter()
                .filter_map(|msg| Self::from_conversation(msg, mode))
                .collect(),
        }
    }
    pub fn from_conversation_template_prompt(
        prompts: Vec<ConversationTemplatePrompt>,
    ) -> Vec<Self> {
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
