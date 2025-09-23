use serde::{Deserialize, Serialize};

use crate::store::Role;

mod chat_request;
mod message;

pub use chat_request::ChatRequest;
pub use message::Message;

#[derive(Debug, Deserialize, Serialize)]
pub struct Delta {
    pub role: Option<Role>,
    pub content: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct OpenAIStreamResponse {
    #[serde(rename = "id")]
    id: String,

    #[serde(rename = "object")]
    object: String,

    #[serde(rename = "created")]
    created: i64,

    #[serde(rename = "choices")]
    pub choices: Vec<Choice>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Choice {
    #[serde(rename = "index")]
    index: i64,

    #[serde(rename = "delta")]
    pub delta: Delta,

    #[serde(rename = "finish_reason")]
    finish_reason: Option<String>,
}
