use crate::errors::ChatGPTResult;

use self::types::{ChatRequest, ChatResponse};

mod types;
pub async fn fetch(api_key: &str, body: &ChatRequest) -> ChatGPTResult<ChatResponse> {
    let mut headers = reqwest::header::HeaderMap::new();
    headers.append("Authorization", format!("Bearer {api_key}").parse()?);
    let client = reqwest::ClientBuilder::new()
        .default_headers(headers)
        .build()?;
    let request = client
        .post("https://api.openai.com/v1/chat/completions")
        .json(body)
        .send()
        .await?
        .json()
        .await?;
    Ok(request)
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
