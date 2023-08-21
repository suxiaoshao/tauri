use async_trait::async_trait;
use futures::StreamExt;
use reqwest_eventsource::{Event, RequestBuilderExt};

use crate::errors::ChatGPTResult;

pub use self::types::{ChatRequest, ChatResponse};

mod types;

#[async_trait]
pub trait FetchRunner {
    fn get_body(&self) -> ChatGPTResult<&ChatRequest>;
    fn get_api_key(&self) -> ChatGPTResult<&str>;
    fn on_open(&mut self) -> ChatGPTResult<()>;
    fn on_message(&mut self, message: ChatResponse) -> ChatGPTResult<()>;
    fn on_error(&mut self, err: reqwest_eventsource::Error) -> ChatGPTResult<()>;
    fn on_close(&mut self) -> ChatGPTResult<()>;
    async fn fetch(&mut self) -> ChatGPTResult<()> {
        let api_key = self.get_api_key()?;
        let body = self.get_body()?;
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
                Ok(Event::Open) => self.on_open()?,
                Ok(Event::Message(message)) => {
                    let message = message.data;
                    if message == "[DONE]" {
                        self.on_close()?;
                        es.close();
                    } else {
                        self.on_message(serde_json::from_str::<ChatResponse>(&message)?)?;
                    }
                }
                Err(err) => {
                    self.on_error(err)?;
                    es.close();
                }
            }
        }
        Ok(())
    }
}
