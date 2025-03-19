use std::collections::HashSet;

use reqwest::Client;
use serde::{Deserialize, Serialize};

use crate::{
    errors::{ChatGPTError, ChatGPTResult},
    fetch::{ChatRequest, ChatResponse, Message},
    store::{Mode, Role},
};

use super::{Adapter, InputItem, InputType};

pub(crate) struct OpenAIAdapter;

fn default_url() -> String {
    "https://api.openai.com/v1/chat/completions".to_string()
}

fn default_models() -> HashSet<String> {
    let mut models = HashSet::new();
    models.insert("gpt-3.5-turbo".to_string());
    models.insert("o3-mini".to_string());
    models.insert("gpt-4o-mini".to_string());
    models.insert("gpt-4".to_string());
    models.insert("gpt-4-turbo".to_string());
    models.insert("gpt-4o".to_string());
    models
}

#[derive(Default, Deserialize, Serialize)]
struct OpenAISettings {
    #[serde(rename = "apiKey")]
    api_key: Option<String>,
    #[serde(default = "default_url")]
    pub url: String,
    #[serde(rename = "httpProxy")]
    pub http_proxy: Option<String>,
    #[serde(default = "default_models")]
    pub models: HashSet<String>,
}

#[derive(Deserialize, Serialize)]
pub(super) struct OpenAIConversationTemplate {
    pub(super) model: String,
    pub(super) temperature: f64,
    pub(super) top_p: f64,
    pub(super) n: u32,
    pub(super) max_completion_tokens: Option<u32>,
    pub(super) presence_penalty: f64,
    pub(super) frequency_penalty: f64,
    pub(super) prompts: Vec<OpenAITemplatePrompt>,
}

#[derive(Deserialize, Serialize)]
pub(super) struct OpenAITemplatePrompt {
    pub(super) prompt: String,
    pub(super) role: Role,
}

pub(super) fn get_openai_template_inputs(
    models: &HashSet<String>,
) -> ChatGPTResult<Vec<InputItem>> {
    let inputs = vec![
        InputItem::new(
            "model",
            "Model",
            "Your model",
            InputType::Select(models.iter().cloned().collect()),
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

impl OpenAIAdapter {
    fn get_body<'a>(
        mode: Mode,
        template: &'a OpenAIConversationTemplate,
        history_messages: Vec<Message<'a>>,
    ) -> ChatRequest<'a> {
        let mut messages = template
            .prompts
            .iter()
            .map(|prompt| Message::new(prompt.role, prompt.prompt.as_str()))
            .collect::<Vec<_>>();
        match mode {
            Mode::Contextual => {
                messages.extend(history_messages);
            }
            Mode::Single => {}
            Mode::AssistantOnly => {
                messages.extend(
                    history_messages
                        .into_iter()
                        .filter(|message| message.role == Role::Assistant),
                );
            }
        }
        ChatRequest {
            messages,
            model: template.model.as_str(),
            stream: false,
            temperature: template.temperature,
            top_p: template.top_p,
            n: template.n,
            max_completion_tokens: template.max_completion_tokens,
            presence_penalty: template.presence_penalty,
            frequency_penalty: template.frequency_penalty,
        }
    }
    fn get_reqwest_client(settings: &OpenAISettings) -> ChatGPTResult<Client> {
        let api_key = settings
            .api_key
            .as_deref()
            .ok_or(ChatGPTError::ApiKeyNotSet)?;
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
    fn name(&self) -> &'static str {
        "OpenAI"
    }

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
        let settings: OpenAISettings = serde_json::from_value(settings.clone())?;
        get_openai_template_inputs(&settings.models)
    }

    fn fetch(
        &self,
        settings: &serde_json::Value,
        template: &serde_json::Value,
        mode: Mode,
        history_messages: Vec<Message<'_>>,
    ) -> impl futures::Stream<Item = ChatGPTResult<String>> {
        async_stream::try_stream! {
            let template = serde_json::from_value(template.clone())?;
            let settings = serde_json::from_value(settings.clone())?;
            let body = Self::get_body(mode,&template, history_messages);
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
