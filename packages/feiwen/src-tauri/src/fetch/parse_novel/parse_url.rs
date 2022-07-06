use scraper::{Html, Selector};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Clone, Hash, Eq, PartialEq)]
pub struct UrlWithName {
    pub name: String,
    pub href: String,
}

pub(in crate::fetch::parse_novel) fn parse_url(
    doc: &Html,
    selector: &Selector,
) -> Option<UrlWithName> {
    let title = doc.select(selector).next()?;
    let name = title.inner_html();
    let href = title.value().attr("href")?.to_string();
    Some(UrlWithName { name, href })
}
