/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-09-22 13:31:27
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-09-24 13:09:31
 * @FilePath: /tauri/packages/feiwen/src-tauri/src/fetch/mod.rs
 */
use reqwest::Client;

use crate::{errors::FeiwenResult, store::service::Novel};

use self::parse_novel::parse_page;

mod get_content;
pub mod parse_novel;

pub trait FetchRunner {
    fn get_url(&self) -> &str;
    fn get_cookies(&self) -> &str;
    fn get_start(&self) -> u32;
    fn get_end(&self) -> u32;
    fn resolve_novel(&self, novels: Vec<Novel>) -> FeiwenResult<i64>;
    fn fetch(&self) -> impl std::future::Future<Output = FeiwenResult<()>> + Send
    where
        Self: Sync,
    {
        async {
            let url = self.get_url();
            let cookies = self.get_cookies();
            let end = self.get_end();
            let start = self.get_start();
            let client = Client::new();
            for i in start..=end {
                let data = fetch_one(url, i, cookies, &client).await?;
                let total = self.resolve_novel(data)?;
                println!("正在获取第{i}/{end}页,总共{total}");
            }
            Ok(())
        }
    }
}

/// 获取一个文件
async fn fetch_one(
    url: &str,
    page: u32,
    cookies: &str,
    client: &Client,
) -> FeiwenResult<Vec<Novel>> {
    let body = get_content::get_content(url, page, cookies, client).await?;
    let data = parse_page(body)?;
    Ok(data)
}
