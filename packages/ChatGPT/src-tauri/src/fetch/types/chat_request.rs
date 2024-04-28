/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-28 07:30:56
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/fetch/types/chat_request.rs
 */
use serde::{Deserialize, Serialize};

use crate::store::{Conversation, ConversationTemplate, Role};

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
        Conversation { messages, .. }: Conversation,
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
        }: ConversationTemplate,
        content: String,
    ) -> Self {
        let mut messages = Message::from_conversations(prompts, messages, mode);
        messages.push(Message::new(Role::User, content));
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
