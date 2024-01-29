/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-01-29 14:35:38
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/fetch/types/chat_request.rs
 */
use serde::{Deserialize, Serialize};

use crate::store::Conversation;

use super::message::Message;

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatRequest {
    pub model: String,
    pub messages: Vec<Message>,
    pub stream: bool,
    temperature: f64,
    top_p: f64,
    n: i64,
    max_tokens: Option<i64>,
    presence_penalty: f64,
    frequency_penalty: f64,
}

impl ChatRequest {
    pub fn new(
        Conversation {
            mode,
            model,
            temperature,
            top_p,
            n,
            max_tokens,
            presence_penalty,
            frequency_penalty,
            prompt,
            messages,
            ..
        }: Conversation,
        content: String,
    ) -> Self {
        let mut messages = messages
            .into_iter()
            .filter_map(|msg| Message::from_conversation(msg, mode))
            .collect::<Vec<_>>();
        if let Some(prompt) = prompt {
            messages.insert(0, Message::new(crate::store::Role::User, prompt));
        }
        messages.push(Message::new(crate::store::Role::User, content));
        Self {
            model,
            messages,
            stream: true,
            temperature,
            top_p,
            n,
            max_tokens,
            presence_penalty,
            frequency_penalty,
        }
    }
}
