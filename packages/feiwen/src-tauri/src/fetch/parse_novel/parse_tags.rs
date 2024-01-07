/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-01-07 19:25:48
 * @FilePath: /tauri/packages/feiwen/src-tauri/src/fetch/parse_novel/parse_tags.rs
 */
use crate::{errors::FeiwenResult, store::service::Tag};
use once_cell::sync::Lazy;
use scraper::{ElementRef, Html, Selector};
use std::collections::HashSet;

static SELECTOR_TAGS: Lazy<Selector> = Lazy::new(|| {
    Selector::parse("div.col-xs-12.h5.brief > span.pull-right.smaller-20 > i > a").unwrap()
});

pub fn parse_tags(doc: &Html) -> FeiwenResult<HashSet<Tag>> {
    let tags = doc
        .select(&SELECTOR_TAGS)
        .map(parse_tag)
        .collect::<FeiwenResult<HashSet<_>>>();
    tags
}

fn parse_tag(title: ElementRef) -> FeiwenResult<Tag> {
    let name = title.inner_html();
    let id = parse_tag_id(title);
    Ok(Tag { name, id })
}

fn parse_tag_id(title: ElementRef) -> Option<i32> {
    let href = title.value().attr("href")?.to_string();
    let search = url::Url::parse(&href).ok()?;
    let mut search = search.query_pairs();
    let id = search.find(|(key, _)| key == "withTag")?.1.to_string();
    id.parse::<i32>().ok()
}
