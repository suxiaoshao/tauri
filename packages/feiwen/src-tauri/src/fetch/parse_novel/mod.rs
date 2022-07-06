use std::collections::HashSet;

use lazy_static::lazy_static;
use scraper::{Html, Selector};
use serde::{Deserialize, Serialize};

use self::{parse_count::NovelCount, parse_url::UrlWithName};
mod parse_author;
mod parse_chapter;
pub mod parse_count;
mod parse_tags;
mod parse_title;
pub mod parse_url;

lazy_static! {
    static ref SELECTOR_ARTICLE: Selector = Selector::parse("article > div").unwrap();
    static ref SELECTOR_RAT: Selector =
        Selector::parse("div:nth-child(1) > span:nth-child(1) > span.badge.bianyuan-tag.badge-tag")
            .unwrap();
    static ref SELECTOR_DESC: Selector =
        Selector::parse("div.col-xs-12.h5.brief-0 > span.smaller-5").unwrap();
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Novel {
    pub title: Title,
    pub author: Author,
    pub latest_chapter: Title,
    pub desc: String,
    pub count: NovelCount,
    pub tags: HashSet<UrlWithName>,
    pub is_limit: bool,
}
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Title {
    pub name: String,
    pub id: i32,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub enum Author {
    Anonymous(String),
    Known(Title),
}

pub fn parse_page(body: String) -> Vec<Novel> {
    let document = Html::parse_document(&body);
    let novels = document
        .select(&SELECTOR_ARTICLE)
        .map(|x| Html::parse_document(&x.inner_html()))
        .filter_map(parse_novel)
        .collect::<Vec<_>>();
    novels
}

fn parse_novel(doc: Html) -> Option<Novel> {
    let title = parse_title::parse_title(&doc)?;
    let author = parse_author::parse_author(&doc)?;
    let latest_chapter = parse_chapter::parse_chapter(&doc)?;
    let desc = doc.select(&SELECTOR_DESC).next()?.inner_html();
    let count = parse_count::parse_count(&doc)?;
    let tags = parse_tags::parse_tags(&doc);
    let is_limit = doc.select(&SELECTOR_RAT).next().is_some();
    Some(Novel {
        title,
        author,
        latest_chapter,
        desc,
        count,
        tags,
        is_limit,
    })
}
