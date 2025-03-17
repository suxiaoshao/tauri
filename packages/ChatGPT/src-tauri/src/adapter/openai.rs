use std::collections::HashMap;

use reqwest::Client;

use crate::{
    errors::ChatGPTResult,
    fetch::{ChatRequest, ChatResponse, Message as FetchMessage},
    plugins::ChatGPTConfig,
    store::{ConversationTemplate, Message, Mode, Role, Status},
};

use super::{Adapter, InputItem, InputType};

pub(crate) struct OpenAIAdapter;

impl OpenAIAdapter {
    fn get_body<'a>(
        template: &'a ConversationTemplate,
        history_messages: &'a [Message],
        user_message: &'a Message,
    ) -> ChatRequest<'a> {
        let mut messages = template
            .prompts
            .iter()
            .map(|prompt| FetchMessage::new(prompt.role, prompt.prompt.as_str()))
            .collect::<Vec<_>>();
        match template.mode {
            Mode::Contextual => {
                messages.extend(
                    history_messages
                        .iter()
                        .filter(|message| message.status == Status::Normal)
                        .map(|message| FetchMessage::new(message.role, message.content.as_str())),
                );
            }
            Mode::Single => {}
            Mode::AssistantOnly => {
                messages.extend(
                    history_messages
                        .iter()
                        .filter(|message| {
                            message.role == Role::Assistant && message.status == Status::Normal
                        })
                        .map(|message| FetchMessage::new(message.role, message.content.as_str())),
                );
            }
        }
        messages.push(FetchMessage::new(
            user_message.role,
            user_message.content.as_str(),
        ));
        ChatRequest {
            messages,
            model: template.model.as_str(),
            stream: false,
            temperature: template.temperature,
            top_p: template.top_p,
            n: template.n,
            max_tokens: template.max_tokens,
            presence_penalty: template.presence_penalty,
            frequency_penalty: template.frequency_penalty,
        }
    }
    fn get_reqwest_client(settings: &ChatGPTConfig) -> ChatGPTResult<Client> {
        let api_key = settings.get_api_key()?;
        let mut headers = reqwest::header::HeaderMap::new();
        headers.append("Authorization", format!("Bearer {api_key}").parse()?);
        let mut client = reqwest::ClientBuilder::new().default_headers(headers);
        match &settings.http_proxy {
            None => {}
            Some(proxy) => {
                client = client.proxy(reqwest::Proxy::all(proxy)?);
            }
        }
        let client = client.build()?;
        Ok(client)
    }
}

impl Adapter for OpenAIAdapter {
    const NAME: &'static str = "OpenAI";

    fn get_setting_inputs(&self) -> Vec<InputItem> {
        let setting_inputs = vec![
            InputItem::new(
                "apiKey",
                "API Key",
                "Your OpenAI API key",
                InputType::Text {
                    max_length: None,
                    min_length: None,
                },
            ),
            InputItem::new(
                "url",
                "API URL",
                "Your OpenAI API URL",
                InputType::Text {
                    max_length: None,
                    min_length: None,
                },
            ),
            InputItem::new(
                "httpProxy",
                "HTTP Proxy",
                "Your HTTP proxy",
                InputType::Optional(Box::new(InputType::Text {
                    max_length: None,
                    min_length: None,
                })),
            ),
            InputItem::new(
                "models",
                "Models",
                "Your models",
                InputType::Array {
                    input_type: Box::new(InputType::Text {
                        max_length: None,
                        min_length: None,
                    }),
                    name: "Model",
                    description: "The model to use",
                },
            ),
        ];
        setting_inputs
    }

    fn get_template_inputs(&self, settings: &serde_json::Value) -> ChatGPTResult<Vec<InputItem>> {
        let settings: ChatGPTConfig = serde_json::from_value(settings.clone())?;
        let inputs = vec![
            InputItem::new(
                "mode",
                "Mode",
                "Your mode",
                InputType::Select(vec![
                    "contextual".to_string(),
                    "single".to_string(),
                    "assistant-only".to_string(),
                ]),
            ),
            InputItem::new(
                "model",
                "Model",
                "Your model",
                InputType::Select(settings.models.iter().cloned().collect()),
            ),
            InputItem::new(
                "temperature",
                "Temperature",
                "Temperature",
                InputType::Float {
                    min: Some(0.0),
                    max: Some(2.0),
                    step: Some(0.1),
                    default: Some(1.0),
                },
            ),
            InputItem::new(
                "top_p",
                "Top P",
                "Top P",
                InputType::Float {
                    min: Some(0.0),
                    max: Some(1.0),
                    step: Some(0.1),
                    default: Some(1.0),
                },
            ),
            InputItem::new(
                "n",
                "N",
                "N",
                InputType::Integer {
                    max: None,
                    min: Some(1),
                    step: Some(1),
                    default: Some(1),
                },
            ),
            InputItem::new(
                "max_completion_tokens",
                "Max Completion Tokens",
                "Max Completion Tokens",
                InputType::Optional(Box::new(InputType::Integer {
                    max: None,
                    min: Some(1),
                    step: Some(1),
                    default: None,
                })),
            ),
            InputItem::new(
                "presence_penalty",
                "Presence Penalty",
                "Presence Penalty",
                InputType::Float {
                    max: Some(2.0),
                    min: Some(-2.0),
                    step: Some(0.1),
                    default: Some(0.0),
                },
            ),
            InputItem::new(
                "frequency_penalty",
                "Frequency Penalty",
                "Frequency Penalty",
                InputType::Float {
                    max: Some(2.0),
                    min: Some(-2.0),
                    step: Some(0.1),
                    default: Some(0.0),
                },
            ),
            InputItem::new(
                "prompts",
                "Prompts",
                "Prompts",
                InputType::ArrayObject(vec![
                    InputItem::new(
                        "prompt",
                        "Prompt",
                        "Prompt",
                        InputType::Text {
                            max_length: None,
                            min_length: Some(1),
                        },
                    ),
                    InputItem::new(
                        "role",
                        "Role",
                        "Role",
                        InputType::Select(vec![
                            "system".to_string(),
                            "user".to_string(),
                            "assistant".to_string(),
                        ]),
                    ),
                ]),
            ),
        ];
        Ok(inputs)
    }

    fn fetch(
        &self,
        settings: &serde_json::Value,
        template: &serde_json::Value,
        history_messages: &[crate::store::Message],
        user_message: crate::store::Message,
    ) -> impl futures::Stream<Item = ChatGPTResult<String>> {
        async_stream::try_stream! {
            let template = serde_json::from_value(template.clone())?;
            let settings = serde_json::from_value(settings.clone())?;
            let body = Self::get_body(&template, history_messages, &user_message);
            let client = Self::get_reqwest_client(&settings)?;
            let response=client.post(settings.url.clone()).json(&body).send().await?;
            let response = response.json::<ChatResponse>().await?;
            let content = response
                .choices
                .into_iter()
                .filter_map(|choice| choice.delta.content)
                .collect::<String>();
            yield content
        }
    }
}
