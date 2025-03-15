use std::collections::HashMap;

use crate::{errors::ChatGPTResult, store::Message};

mod openai_stream;

enum InputType {
    Text,
    Float,
    Boolean,
    Integer,
    Select(Vec<String>),
    Array(Box<InputType>),
    Object(HashMap<String, InputType>),
}

struct InputItem {
    id: &'static str,
    name: &'static str,
    description: &'static str,
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
    type Settings: serde::Serialize + for<'de> serde::Deserialize<'de>;
    type Template: serde::Serialize + for<'de> serde::Deserialize<'de>;
    const NAME: &'static str;
    fn get_setting_inputs(&self) -> Vec<InputItem>;
    fn get_template_inputs(&self, settings: &Self::Settings) -> Vec<InputItem>;
    fn fetch(
        &self,
        settings: Self::Settings,
        template: Self::Template,
        history_messages: &[Message],
        user_message: Message,
    ) -> impl futures::Stream<Item = ChatGPTResult<String>>;
}

pub(crate) use openai_stream::OpenAIStreamAdapter;
