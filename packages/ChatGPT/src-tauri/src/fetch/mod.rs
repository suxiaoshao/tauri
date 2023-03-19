use futures::StreamExt;
use reqwest_eventsource::{Event, RequestBuilderExt};

use crate::errors::ChatGPTResult;

use self::types::{ChatRequest, ChatResponse};

mod types;
pub async fn fetch(api_key: &str, body: &ChatRequest) -> ChatGPTResult<()> {
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
                    es.close();
                } else {
                    match serde_json::from_str::<ChatResponse>(&message) {
                        Ok(data) => {
                            let data =
                                data.choices.into_iter().fold(String::new(), |mut s, data| {
                                    if let Some(data) = data.delta.content {
                                        s.push_str(&data);
                                    }
                                    s
                                });
                            print!("{}", data)
                        }
                        Err(err) => {
                            println!("Error: {},{message}", err);
                        }
                    };
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

    use super::types::{ChatRequest, Message};

    #[tokio::test]
    async fn test_fetch() -> ChatGPTResult<()> {
        let api_key = std::env::var("OPENAI_API_KEY").unwrap();
        let request = ChatRequest::new(
            Default::default(),
            vec![Message::new(
                super::types::Role::User,
                "请你帮我把中文翻译成英文，并且使用github issues 的风格".to_string(),
            )],
        );
        let response = super::fetch(&api_key, &request).await?;
        println!("{:#?}", response);
        Ok(())
    }
}
