use scraper::{Html, Selector};

use crate::store::types::UrlWithName;

pub(in crate::fetch::parse_novel) fn parse_url(
    doc: &Html,
    selector: &Selector,
) -> Option<UrlWithName> {
    let title = doc.select(selector).next()?;
    let name = title.inner_html();
    let href = title.value().attr("href")?.to_string();
    Some(UrlWithName { name, href })
}
