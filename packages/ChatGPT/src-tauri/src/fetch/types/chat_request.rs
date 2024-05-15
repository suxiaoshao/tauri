/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-28 07:30:56
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/fetch/types/chat_request.rs
 */
use serde::{Deserialize, Serialize};

use crate::{
    plugins::TemporaryMessage,
    store::{ConversationTemplate, Message as StoreMessage, Role, Status},
};

use super::message::Message;

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatRequest<'a> {
    pub model: &'a str,
    pub messages: Vec<Message<'a>>,
    pub stream: bool,
    temperature: f64,
    top_p: f64,
    n: i64,
    max_tokens: Option<i64>,
    presence_penalty: f64,
    frequency_penalty: f64,
}

impl ChatRequest<'_> {
    pub fn new<'a, T: BaseMessage>(
        messages: &'a [T],
        ConversationTemplate {
            mode,
            model,
            temperature,
            top_p,
            n,
            max_tokens,
            presence_penalty,
            frequency_penalty,
            prompts,
            ..
        }: &'a ConversationTemplate,
        content: &'a str,
    ) -> ChatRequest<'a> {
        let mut messages = Message::from_conversations(prompts, messages, *mode);
        messages.push(Message::new(Role::User, content));
        ChatRequest {
            model,
            messages,
            stream: true,
            temperature: *temperature,
            top_p: *top_p,
            n: *n,
            max_tokens: *max_tokens,
            presence_penalty: *presence_penalty,
            frequency_penalty: *frequency_penalty,
        }
    }
}
pub trait BaseMessage {
    fn role(&self) -> Role;
    fn content(&self) -> &str;
    fn status(&self) -> Status;
}

impl BaseMessage for StoreMessage {
    fn role(&self) -> Role {
        self.role
    }

    fn content(&self) -> &str {
        &self.content
    }

    fn status(&self) -> Status {
        self.status
    }
}

impl BaseMessage for TemporaryMessage {
    fn role(&self) -> Role {
        self.role
    }

    fn content(&self) -> &str {
        &self.content
    }

    fn status(&self) -> Status {
        self.status
    }
}
