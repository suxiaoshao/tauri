/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-01-07 19:24:15
 * @FilePath: /tauri/packages/feiwen/src-tauri/src/fetch/parse_novel/parse_author.rs
 */
use nom::{
    bytes::complete::{tag, take_till},
    combinator::complete,
    number::complete::float,
    sequence::tuple,
    IResult,
};
use once_cell::sync::Lazy;
use scraper::{Html, Selector};

use crate::{
    errors::{FeiwenError, FeiwenResult},
    store::types::UrlWithName,
};

use super::{parse_url::parse_url, Author, Title};
static SELECTOR_AUTHOR: Lazy<Selector> =
    Lazy::new(|| Selector::parse("div:nth-child(1) > span.pull-right.smaller-5 > a").unwrap());
static SELECTOR_AUTHOR_NNONYMOUS: Lazy<Selector> =
    Lazy::new(|| Selector::parse("div:nth-child(1) > span.pull-right.smaller-5 > span").unwrap());

pub fn parse_author(doc: &Html) -> FeiwenResult<Author> {
    let value = match parse_url(doc, &SELECTOR_AUTHOR) {
        Ok(UrlWithName { name, href }) => {
            let (_, id) = parse_author_url(&href)
                .map_err(|err| FeiwenError::AuthorIdParse(err.to_string()))?;
            Author::Known(Title { name, id })
        }
        Err(_) => {
            let author = match doc
                .select(&SELECTOR_AUTHOR_NNONYMOUS)
                .next()
                .ok_or(FeiwenError::AuthorNameParse)
            {
                Ok(element) => element.inner_html(),
                Err(_) => "".to_owned(),
            };
            Author::Anonymous(author)
        }
    };
    Ok(value)
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
    fn test() -> anyhow::Result<()> {
        let input = "https://xn--pxtr7m.com/users/538220";
        parse_author_url(input)?;
        Ok(())
    }
}
