use reqwest::Client;

pub async fn get_content(
    url: &str,
    page: u32,
    cookies: &str,
    client: &Client,
) -> anyhow::Result<String> {
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
