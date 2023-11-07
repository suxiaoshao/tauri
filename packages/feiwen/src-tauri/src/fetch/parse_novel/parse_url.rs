use scraper::{Html, Selector};

use crate::{
    errors::{FeiwenError, FeiwenResult},
    store::types::UrlWithName,
};

pub(in crate::fetch::parse_novel) fn parse_url(
    doc: &Html,
    selector: &Selector,
) -> FeiwenResult<UrlWithName> {
    let title = doc.select(selector).next().ok_or(FeiwenError::HrefParse)?;
    let name = title.inner_html();
    let href = title
        .value()
        .attr("href")
        .ok_or(FeiwenError::HrefParse)?
        .to_string();
    Ok(UrlWithName { name, href })
}
