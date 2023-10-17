use nom::{
    bytes::complete::{tag, take_till},
    number::streaming::float,
    sequence::tuple,
    IResult,
};
use scraper::{Html, Selector};

use crate::store::types::UrlWithName;

use super::{parse_url::parse_url, Title};
use lazy_static::lazy_static;

lazy_static! {
    static ref SELECTOR_NOVEL: Selector =
        Selector::parse("div:nth-child(1) > span:nth-child(1) > a").unwrap();
}

pub fn parse_title(doc: &Html) -> Option<Title> {
    let UrlWithName { name, href } = parse_url(doc, &SELECTOR_NOVEL)?;
    let (_, id) = parse_novel_url(&href).ok()?;
    Some(Title { name, id })
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
    fn test() {
        let input = "https://xn--pxtr7m.com/threads/165143/profile";
        parse_novel_url(input).unwrap();
    }
}
