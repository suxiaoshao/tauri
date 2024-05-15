/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-15 20:41:55
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/fetch/types/message.rs
 */
use serde::{Deserialize, Serialize};

use crate::store::{ConversationTemplatePrompt, Mode};
use crate::store::{Role, Status};

use super::chat_request::BaseMessage;

#[derive(Debug, Deserialize, Serialize)]
pub struct Message<'a> {
    pub role: Role,
    pub content: &'a str,
}

impl Message<'_> {
    pub fn from_conversations<'a, T: BaseMessage>(
        prompts: &'a [ConversationTemplatePrompt],
        store_messages: &'a [T],
        mode: Mode,
    ) -> Vec<Message<'a>> {
        let mut messages = Self::from_conversation_template_prompt(prompts);
        messages.extend(Self::from_messages(store_messages, mode));
        messages
    }
    fn from_message<T: BaseMessage>(base_message: &T, mode: Mode) -> Option<Message<'_>> {
        match (mode, base_message.status(), base_message.role()) {
            (Mode::Contextual, Status::Normal, _) => Some(Message {
                role: base_message.role(),
                content: base_message.content(),
            }),
            (Mode::AssistantOnly, Status::Normal, Role::Assistant) => Some(Message {
                role: base_message.role(),
                content: base_message.content(),
            }),
            _ => None,
        }
    }
    fn from_messages<T: BaseMessage>(messages: &[T], mode: Mode) -> Vec<Message<'_>> {
        match mode {
            Mode::Single => vec![],
            _ => messages
                .iter()
                .filter_map(|msg| Self::from_message(msg, mode))
                .collect(),
        }
    }
    fn from_conversation_template_prompt(
        prompts: &[ConversationTemplatePrompt],
    ) -> Vec<Message<'_>> {
        prompts
            .iter()
            .map(|prompt| Message {
                role: prompt.role,
                content: prompt.prompt.as_str(),
            })
            .collect()
    }
    pub fn new(role: Role, content: &str) -> Message<'_> {
        Message { role, content }
    }
}
