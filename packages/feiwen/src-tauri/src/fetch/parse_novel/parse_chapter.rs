use nom::{
    bytes::complete::{tag, take_till},
    combinator::complete,
    number::complete::float,
    sequence::tuple,
    IResult,
};
use scraper::{Html, Selector};

use crate::{
    errors::{FeiwenError, FeiwenResult},
    store::types::UrlWithName,
};

use super::{parse_url::parse_url, Title};
use lazy_static::lazy_static;

lazy_static! {
    static ref SELECTOR_CHAPTER: Selector =
        Selector::parse("div.col-xs-12.h5.brief > span.grayout.smaller-20 > a").unwrap();
}

pub fn parse_chapter(doc: &Html) -> FeiwenResult<Title> {
    let UrlWithName { name, href } = parse_url(doc, &SELECTOR_CHAPTER)?;
    let (_, id) =
        parse_chapter_url(&href).map_err(|err| FeiwenError::ChapterIdParse(err.to_string()))?;
    Ok(Title { name, id })
}

fn parse_chapter_url(name: &str) -> IResult<&str, i32> {
    let (name, (_, _, _, data)) = complete(tuple((
        tag("https://"),
        take_till(|c| c == '/'),
        tag("/posts/"),
        float,
    )))(name)?;
    Ok((name, data as i32))
}

#[cfg(test)]
mod test {
    use super::parse_chapter_url;

    #[test]
    fn test() {
        let input = "https://xn--pxtr7m.com/posts/8722849";
        parse_chapter_url(input).unwrap();
    }
}
