use futures::StreamExt;
use reqwest_eventsource::{Event, RequestBuilderExt};

use crate::errors::ChatGPTResult;

pub use self::types::{ChatRequest, ChatResponse, Message, Model, Role};

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

#[cfg(test)]
mod test {
    use crate::errors::ChatGPTResult;

    #[tokio::test]
    async fn test() -> ChatGPTResult<()> {
        use super::*;
        let body = ChatRequest::new(
            Model::Gpt35,
            vec![Message::new(Role::User, "Hello".to_string())],
        );
        let api_key = dotenv::var("OPENAI_API_KEY").unwrap();
        fetch(&api_key, &body, |message| {
            print!(
                "{}",
                message
                    .choices
                    .into_iter()
                    .fold(String::new(), |mut acc, choice| {
                        if let Some(content) = choice.delta.content {
                            acc.push_str(&content);
                        }
                        acc
                    })
            );
        })
        .await?;
        println!();
        Ok(())
    }
}
