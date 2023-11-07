use reqwest::Client;

use crate::errors::FeiwenResult;

pub async fn get_content(
    url: &str,
    page: u32,
    cookies: &str,
    client: &Client,
) -> FeiwenResult<String> {
    let body = client
        .get(url)
        .header("cookie", cookies)
        .query(&[("page", page)])
        .send()
        .await?
        .text()
        .await?;
    Ok(body)
}
