use std::collections::HashMap;

use crate::{errors::ChatGPTResult, store::Message};

mod openai;
mod openai_stream;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(tag = "tag", content = "value", rename_all = "camelCase")]
pub(crate) enum InputType {
    Text {
        max_length: Option<usize>,
        min_length: Option<usize>,
    },
    Float {
        max: Option<f64>,
        min: Option<f64>,
        step: Option<f64>,
        default: Option<f64>,
    },
    Boolean {
        default: Option<bool>,
    },
    Integer {
        max: Option<i64>,
        min: Option<i64>,
        step: Option<i64>,
        default: Option<i64>,
    },
    Select(Vec<String>),
    Array {
        #[serde(rename = "inputType")]
        input_type: Box<InputType>,
        name: &'static str,
        description: &'static str,
    },
    ArrayObject(Vec<InputItem>),
    Object(Vec<InputItem>),
    Optional(Box<InputType>),
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
