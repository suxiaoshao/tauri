use std::collections::HashMap;

use futures::StreamExt;
use reqwest::Client;
use reqwest_eventsource::{Event, RequestBuilderExt};

use crate::{
    errors::ChatGPTResult,
    fetch::{ChatRequest, ChatResponse, Message as FetchMessage},
    plugins::ChatGPTConfig,
    store::{ConversationTemplate, Message, Mode, Role, Status},
};

use super::{Adapter, InputItem, InputType};

pub(crate) struct OpenAIStreamAdapter;

impl OpenAIStreamAdapter {
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
            stream: true,
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

impl Adapter for OpenAIStreamAdapter {
    type Settings = ChatGPTConfig;

    type Template = ConversationTemplate;

    const NAME: &'static str = "openai-stream";

    fn get_setting_inputs(&self) -> Vec<InputItem> {
        let setting_inputs = vec![
            InputItem::new("apiKey", "API Key", "Your OpenAI API key", InputType::Text),
            InputItem::new("url", "API URL", "Your OpenAI API URL", InputType::Text),
            InputItem::new(
                "httpProxy",
                "HTTP Proxy",
                "Your HTTP proxy",
                InputType::Text,
            ),
            InputItem::new(
                "models",
                "Models",
                "Your models",
                InputType::Array(Box::new(InputType::Text)),
            ),
        ];
        setting_inputs
    }

    fn get_template_inputs(&self, settings: &Self::Settings) -> Vec<InputItem> {
        vec![
            InputItem::new("name", "Name", "Your name", InputType::Text),
            InputItem::new("icon", "Icon", "Your icon", InputType::Text),
            InputItem::new(
                "description",
                "Description",
                "Your description",
                InputType::Text,
            ),
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
                InputType::Float,
            ),
            InputItem::new("topN", "Top N", "Top N", InputType::Float),
            InputItem::new("n", "N", "N", InputType::Integer),
            InputItem::new("maxTokens", "Max Tokens", "Max Tokens", InputType::Integer),
            InputItem::new(
                "presencePenalty",
                "Presence Penalty",
                "Presence Penalty",
                InputType::Float,
            ),
            InputItem::new(
                "frequencyPenalty",
                "Frequency Penalty",
                "Frequency Penalty",
                InputType::Float,
            ),
            InputItem::new(
                "prompts",
                "Prompts",
                "Prompts",
                InputType::Array(Box::new(InputType::Object({
                    let mut map = HashMap::new();
                    map.insert("prompt".to_string(), InputType::Text);
                    map.insert(
                        "role".to_string(),
                        InputType::Select(vec![
                            "system".to_string(),
                            "user".to_string(),
                            "assistant".to_string(),
                        ]),
                    );
                    map
                }))),
            ),
        ]
    }

    fn fetch(
        &self,
        settings: Self::Settings,
        template: Self::Template,
        history_messages: &[Message],
        user_message: Message,
    ) -> impl futures::Stream<Item = ChatGPTResult<String>> {
        async_stream::try_stream! {
            let body = Self::get_body(&template, history_messages, &user_message);
            let client = Self::get_reqwest_client(&settings)?;
            let mut es = client.post(settings.url.as_str()).json(&body).eventsource()?;
            while let Some(event) = es.next().await {
                match event {
                    Ok(Event::Open) => {},
                    Ok(Event::Message(message)) => {
                        let message = message.data;
                        if message == "[DONE]" {
                            es.close();
                        } else {
                            let response= serde_json::from_str::<ChatResponse>(&message)?;
                            let content = response
                                .choices
                                .into_iter()
                                .filter_map(|choice| choice.delta.content)
                                .collect::<String>();
                            yield content
                        }
                    }
                    Err(_err) => {
                        es.close();
                    }
                }
            }
        }
    }
}
