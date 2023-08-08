use serde::{Deserialize, Serialize};

use crate::store::{Model, Role};

#[derive(Debug, Deserialize, Serialize)]
pub struct Message {
    pub role: Role,
    pub content: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Delta {
    pub role: Option<Role>,
    pub content: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatRequest {
    pub model: Model,
    pub messages: Vec<Message>,
    pub stream: bool,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ChatResponse {
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

#[derive(Serialize, Deserialize, Debug)]
pub struct Usage {
    #[serde(rename = "prompt_tokens")]
    prompt_tokens: i64,

    #[serde(rename = "completion_tokens")]
    completion_tokens: i64,

    #[serde(rename = "total_tokens")]
    total_tokens: i64,
}

#[derive(Serialize, Deserialize)]
pub struct ChatRequestError {
    #[serde(rename = "error")]
    error: ChatRequestErrorContent,
}
#[derive(Serialize, Deserialize)]
pub struct ChatRequestErrorContent {
    message: String,
    #[serde(rename = "type")]
    type_code: String,
}
