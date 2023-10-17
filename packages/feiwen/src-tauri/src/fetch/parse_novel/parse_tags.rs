use std::collections::HashSet;

use scraper::{ElementRef, Html, Selector};

use lazy_static::lazy_static;

use crate::store::types::UrlWithName;

lazy_static! {
    static ref SELECTOR_TAGS: Selector =
        Selector::parse("div.col-xs-12.h5.brief > span.pull-right.smaller-20 > i > a").unwrap();
}

pub fn parse_tags(doc: &Html) -> HashSet<UrlWithName> {
    let tags = doc
        .select(&SELECTOR_TAGS)
        .filter_map(parse_tag)
        .collect::<HashSet<_>>();
    tags
}

fn parse_tag(title: ElementRef) -> Option<UrlWithName> {
    let name = title.inner_html();
    let href = title.value().attr("href")?.to_string();
    Some(UrlWithName { name, href })
}
