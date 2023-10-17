use lazy_static::lazy_static;
use nom::{
    bytes::complete::{tag, take_till},
    combinator::complete,
    number::complete::float,
    sequence::tuple,
    IResult,
};
use scraper::{Html, Selector};

use crate::store::types::UrlWithName;

use super::{parse_url::parse_url, Author, Title};
lazy_static! {
    static ref SELECTOR_AUTHOR: Selector =
        Selector::parse("div:nth-child(1) > span.pull-right.smaller-5 > a").unwrap();
    static ref SELECTOR_AUTHOR_NNONYMOUS: Selector =
        Selector::parse("div:nth-child(1) > span.pull-right.smaller-5 > span").unwrap();
}

pub fn parse_author(doc: &Html) -> Option<Author> {
    let value = match parse_url(doc, &SELECTOR_AUTHOR) {
        Some(UrlWithName { name, href }) => {
            let (_, id) = parse_author_url(&href).ok()?;
            Author::Known(Title { name, id })
        }
        None => {
            let author = doc.select(&SELECTOR_AUTHOR_NNONYMOUS).next()?.inner_html();
            Author::Anonymous(author)
        }
    };
    Some(value)
}

fn parse_author_url(name: &str) -> IResult<&str, i32> {
    let (name, (_, _, _, data)) = complete(tuple((
        tag("https://"),
        take_till(|c| c == '/'),
        tag("/users/"),
        float,
    )))(name)?;
    Ok((name, data as i32))
}

#[cfg(test)]
mod test {
    use super::parse_author_url;

    #[test]
    fn test() {
        let input = "https://xn--pxtr7m.com/users/538220";
        parse_author_url(input).unwrap();
    }
}
