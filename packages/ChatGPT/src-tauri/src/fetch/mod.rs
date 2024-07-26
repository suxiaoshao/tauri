/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-15 20:42:50
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/fetch/mod.rs
 */
use futures::StreamExt;
use reqwest_eventsource::{Event, RequestBuilderExt};

use crate::errors::ChatGPTResult;

pub use self::types::{ChatRequest, ChatResponse, Message};

mod types;

pub trait FetchRunner {
    fn get_body(&self) -> ChatGPTResult<ChatRequest<'_>>;
    fn get_api_key(&self) -> ChatGPTResult<&str>;
    fn get_http_proxy(&self) -> ChatGPTResult<&Option<String>>;
    fn on_open(&mut self) -> ChatGPTResult<()>;
    fn on_message(&mut self, message: ChatResponse) -> ChatGPTResult<()>;
    fn on_error(&mut self, err: reqwest_eventsource::Error) -> ChatGPTResult<()>;
    fn on_close(&mut self) -> ChatGPTResult<()>;
    fn url(&self) -> &str;
    async fn fetch(&mut self) -> ChatGPTResult<()> {
        let api_key = self.get_api_key()?;
        let body = self.get_body()?;
        let mut headers = reqwest::header::HeaderMap::new();
        headers.append("Authorization", format!("Bearer {api_key}").parse()?);
        let mut client = reqwest::ClientBuilder::new().default_headers(headers);
        match self.get_http_proxy()? {
            None => {}
            Some(proxy) => {
                client = client.proxy(reqwest::Proxy::all(proxy)?);
            }
        }
        let client = client.build()?;
        let mut es = client.post(self.url()).json(&body).eventsource()?;
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
