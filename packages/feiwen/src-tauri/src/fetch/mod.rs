use anyhow::Ok;
use reqwest::Client;

use crate::store::StoreManager;

use self::parse_novel::{parse_page, Novel};

mod get_content;
pub mod parse_novel;

pub async fn fetch_many(url: String, start: u32, end: u32, cookies: String) -> anyhow::Result<()> {
    let client = Client::new();
    let store = StoreManager::new()?;
    for i in start..=end {
        let data = fetch_one(&url, i, &cookies, &client).await?;
        store.add_novels(data)?;
        println!("正在获取第{}/{}页,总共{}", i, end, store.len()?);
    }
    Ok(())
}

/// 获取一个文件
async fn fetch_one(
    url: &str,
    page: u32,
    cookies: &str,
    client: &Client,
) -> anyhow::Result<Vec<Novel>> {
    let body = get_content::get_content(url, page, cookies, client).await?;
    let data = parse_page(body);
    Ok(data)
}
