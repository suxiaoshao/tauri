/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-01-07 19:23:04
 * @FilePath: /tauri/packages/feiwen/src-tauri/src/fetch/parse_novel/mod.rs
 */
use once_cell::sync::Lazy;
use scraper::{Html, Selector};

use crate::{
    errors::{FeiwenError, FeiwenResult},
    store::{
        service::Novel,
        types::{Author, Title},
    },
};

mod parse_author;
mod parse_chapter;
pub mod parse_count;
mod parse_tags;
mod parse_title;
pub mod parse_url;

static SELECTOR_ARTICLE: Lazy<Selector> = Lazy::new(|| Selector::parse("article > div").unwrap());
static SELECTOR_RAT: Lazy<Selector> = Lazy::new(|| {
    Selector::parse("div:nth-child(1) > span:nth-child(1) > span.badge.bianyuan-tag.badge-tag")
        .unwrap()
});
static SELECTOR_DESC: Lazy<Selector> =
    Lazy::new(|| Selector::parse("div.col-xs-12.h5.brief-0 > span.smaller-5").unwrap());

pub fn parse_page(body: String) -> FeiwenResult<Vec<Novel>> {
    let document = Html::parse_document(&body);
    let novels = document
        .select(&SELECTOR_ARTICLE)
        .map(|x| Html::parse_document(&x.inner_html()))
        .map(parse_novel)
        .collect::<FeiwenResult<Vec<_>>>()?;
    Ok(novels)
}

fn parse_novel(doc: Html) -> FeiwenResult<Novel> {
    let title = parse_title::parse_title(&doc)?;
    let author = parse_author::parse_author(&doc)?;
    let latest_chapter = parse_chapter::parse_chapter(&doc)?;
    let desc = doc
        .select(&SELECTOR_DESC)
        .next()
        .ok_or(FeiwenError::DescParse)?
        .inner_html();
    let count = parse_count::parse_count(&doc)?;
    let tags = parse_tags::parse_tags(&doc)?;
    let is_limit = doc.select(&SELECTOR_RAT).next().is_some();
    Ok(Novel {
        title,
        author,
        latest_chapter,
        desc,
        count,
        tags,
        is_limit,
    })
}
