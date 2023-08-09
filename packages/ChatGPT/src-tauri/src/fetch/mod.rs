use futures::StreamExt;
use reqwest_eventsource::{Event, RequestBuilderExt};

use crate::errors::ChatGPTResult;

pub use self::types::{ChatRequest, ChatResponse};

mod types;
pub async fn fetch<F>(api_key: &str, body: &ChatRequest, func: F) -> ChatGPTResult<()>
where
    F: Fn(ChatResponse),
{
    let mut headers = reqwest::header::HeaderMap::new();
    headers.append("Authorization", format!("Bearer {api_key}").parse()?);
    let client = reqwest::ClientBuilder::new()
        .default_headers(headers)
        .build()?;
    let mut es = client
        .post("https://api.openai.com/v1/chat/completions")
        .json(&body)
        .eventsource()?;
    while let Some(event) = es.next().await {
        match event {
            Ok(Event::Open) => log::info!("Connection Open!"),
            Ok(Event::Message(message)) => {
                let message = message.data;
                if message == "[DONE]" {
                    log::info!("Connection Closed!");
                    es.close();
                } else {
                    func(serde_json::from_str::<ChatResponse>(&message)?);
                }
            }
            Err(err) => {
                log::warn!("Error: {}", err);
                es.close();
            }
        }
    }
    Ok(())
}
