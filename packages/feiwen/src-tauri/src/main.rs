#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use fetch::parse_novel::Novel;
use store::model::{NovelModel, TagModel};

#[macro_use]
extern crate diesel;
pub mod fetch;
mod query;
mod store;

fn main() -> anyhow::Result<()> {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![fetch, tags, query])
        .run(tauri::generate_context!())?;
    Ok(())
}

#[tauri::command]
async fn fetch(url: String, start_page: u32, end_page: u32, cookies: String) -> Result<(), String> {
    fetch::fetch_many(url, start_page, end_page, cookies)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}
#[tauri::command]
fn tags() -> Result<Vec<String>, String> {
    TagModel::all_tags().map_err(|x| x.to_string())
}
#[tauri::command]
async fn query(
    offset: Option<i64>,
    limit: Option<i64>,
    is_limit: bool,
    tag: Option<String>,
) -> Result<Vec<Novel>, String> {
    let offset = offset.unwrap_or(0);
    let limit = limit.unwrap_or(100);
    let limit = if limit > 100 { 100 } else { limit };
    match tag {
        Some(tag) => NovelModel::query_with_tag(offset, limit, is_limit, tag),
        None => NovelModel::query(offset, limit, is_limit),
    }
    .map_err(|x| x.to_string())
}
