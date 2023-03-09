use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct Message {
    pub role: Role,
    pub content: String,
}

impl Message {
    pub fn new(role: Role, content: String) -> Self {
        Self { role, content }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "lowercase")]
pub enum Role {
    System,
    #[default]
    User,
    Assistant,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatRequest {
    pub model: Modal,
    pub messages: Vec<Message>,
}

impl ChatRequest {
    pub fn new(model: Modal, messages: Vec<Message>) -> Self {
        Self { model, messages }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub enum Modal {
    #[serde(rename = "text-davinci-003")]
    TextDavinci,
    #[default]
    #[serde(rename = "gpt-3.5-turbo")]
    Gpt35,
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
    choices: Vec<Choice>,

    #[serde(rename = "usage")]
    usage: Usage,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Choice {
    #[serde(rename = "index")]
    index: i64,

    #[serde(rename = "message")]
    message: Message,

    #[serde(rename = "finish_reason")]
    finish_reason: String,
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
