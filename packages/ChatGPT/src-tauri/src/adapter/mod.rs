use std::collections::HashMap;

use crate::{errors::ChatGPTResult, store::Message};

mod openai;
mod openai_stream;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(tag = "tag", content = "value", rename_all = "camelCase")]
pub(crate) enum InputType {
    Text,
    Float,
    Boolean,
    Integer,
    Select(Vec<String>),
    Array(Box<InputType>),
    Object(HashMap<String, InputType>),
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub(crate) struct InputItem {
    id: &'static str,
    name: &'static str,
    description: &'static str,
    #[serde(rename = "inputType")]
    input_type: InputType,
}

impl InputItem {
    fn new(
        id: &'static str,
        name: &'static str,
        description: &'static str,
        input_type: InputType,
    ) -> Self {
        Self {
            id,
            name,
            description,
            input_type,
        }
    }
}

pub trait Adapter {
    const NAME: &'static str;
    fn get_setting_inputs(&self) -> Vec<InputItem>;
    fn get_template_inputs(&self, settings: &serde_json::Value) -> ChatGPTResult<Vec<InputItem>>;
    fn fetch(
        &self,
        settings: &serde_json::Value,
        template: &serde_json::Value,
        history_messages: &[Message],
        user_message: Message,
    ) -> impl futures::Stream<Item = ChatGPTResult<String>>;
}

pub(crate) use openai::OpenAIAdapter;
pub(crate) use openai_stream::OpenAIStreamAdapter;
