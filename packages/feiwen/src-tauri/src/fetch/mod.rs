use reqwest::Client;

use crate::errors::FeiwenResult;

use self::parse_novel::{parse_page, Novel};

mod get_content;
pub mod parse_novel;

pub async fn fetch_many(url: String, start: u32, end: u32, cookies: String) -> FeiwenResult<()> {
    let client = Client::new();
    for i in start..=end {
        let data = fetch_one(&url, i, &cookies, &client).await?;
        println!("正在获取第{}/{}页,总共{}", i, end, todo!());
    }
    Ok(())
}

/// 获取一个文件
async fn fetch_one(
    url: &str,
    page: u32,
    cookies: &str,
    client: &Client,
) -> FeiwenResult<Vec<Novel>> {
    let body = get_content::get_content(url, page, cookies, client).await?;
    let data = parse_page(body);
    Ok(data)
}
