/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-01-07 19:26:07
 * @FilePath: /tauri/packages/feiwen/src-tauri/src/fetch/parse_novel/parse_title.rs
 */
use nom::{
    bytes::complete::{tag, take_till},
    number::streaming::float,
    sequence::tuple,
    IResult,
};
use scraper::{Html, Selector};

use crate::{
    errors::{FeiwenError, FeiwenResult},
    store::types::UrlWithName,
};

use super::{parse_url::parse_url, Title};
use once_cell::sync::Lazy;

static SELECTOR_NOVEL: Lazy<Selector> =
    Lazy::new(|| Selector::parse("div:nth-child(1) > span:nth-child(1) > a").unwrap());

pub fn parse_title(doc: &Html) -> FeiwenResult<Title> {
    let UrlWithName { name, href } = parse_url(doc, &SELECTOR_NOVEL)?;
    let (_, id) =
        parse_novel_url(&href).map_err(|err| FeiwenError::NovelIdParse(err.to_string()))?;
    Ok(Title { name, id })
}

fn parse_novel_url(name: &str) -> IResult<&str, i32> {
    let (name, (_, _, _, data, _)) = tuple((
        tag("https://"),
        take_till(|c| c == '/'),
        tag("/threads/"),
        float,
        tag("/profile"),
    ))(name)?;
    Ok((name, data as i32))
}
#[cfg(test)]
mod test {
    use super::parse_novel_url;

    #[test]
    fn test() -> anyhow::Result<()> {
        let input = "https://xn--pxtr7m.com/threads/165143/profile";
        parse_novel_url(input)?;
        Ok(())
    }
}
