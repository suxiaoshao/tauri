use std::collections::HashSet;

use futures::StreamExt;
use reqwest::Client;
use reqwest_eventsource::{Event, RequestBuilderExt};
use serde::{Deserialize, Serialize};

use crate::{
    errors::{ChatGPTError, ChatGPTResult},
    fetch::{ChatRequest, ChatResponse, Message as FetchMessage},
    store::{Message, Mode, Role, Status},
};

use super::{
    Adapter, InputItem, OpenAIAdapter,
    openai::{OpenAIConversationTemplate, get_openai_template_inputs},
};

fn default_url() -> String {
    "https://api.openai.com/v1/chat/completions".to_string()
}

fn default_models() -> HashSet<String> {
    let mut models = HashSet::new();
    models.insert("gpt-3.5-turbo".to_string());
    models.insert("gpt-4o-mini".to_string());
    models.insert("gpt-4".to_string());
    models.insert("gpt-4-turbo".to_string());
    models.insert("gpt-4o".to_string());
    models
}

#[derive(Default, Deserialize, Serialize)]
struct OpenAIStreamSettings {
    #[serde(rename = "apiKey")]
    api_key: Option<String>,
    #[serde(default = "default_url")]
    pub url: String,
    #[serde(rename = "httpProxy")]
    pub http_proxy: Option<String>,
    #[serde(default = "default_models")]
    pub models: HashSet<String>,
}

pub(crate) struct OpenAIStreamAdapter;

impl OpenAIStreamAdapter {
    fn get_body<'a>(
        template: &'a OpenAIConversationTemplate,
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
            max_completion_tokens: template.max_completion_tokens,
            presence_penalty: template.presence_penalty,
            frequency_penalty: template.frequency_penalty,
        }
    }
    fn get_reqwest_client(settings: &OpenAIStreamSettings) -> ChatGPTResult<Client> {
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

impl Adapter for OpenAIStreamAdapter {
    const NAME: &'static str = "OpenAI Stream";

    fn get_setting_inputs(&self) -> Vec<InputItem> {
        OpenAIAdapter.get_setting_inputs()
    }

    fn get_template_inputs(&self, settings: &serde_json::Value) -> ChatGPTResult<Vec<InputItem>> {
        let settings: OpenAIStreamSettings = serde_json::from_value(settings.clone())?;
        get_openai_template_inputs(&settings.models)
    }

    fn fetch(
        &self,
        settings: &serde_json::Value,
        template: &serde_json::Value,
        history_messages: &[Message],
        user_message: Message,
    ) -> impl futures::Stream<Item = ChatGPTResult<String>> {
        async_stream::try_stream! {
            let template = serde_json::from_value(template.clone())?;
            let settings = serde_json::from_value(settings.clone())?;
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
