use lazy_static::lazy_static;
use nom::{
    branch::alt,
    bytes::complete::tag,
    combinator::{opt, value},
    number::complete::float,
    sequence::tuple,
    IResult,
};
use scraper::{Html, Selector};
use serde::{Deserialize, Serialize};
lazy_static! {
    static ref SELECTOR_COUNT: Selector =
        Selector::parse("div.col-xs-12.h5.brief-0 > span.pull-right.smaller-30 > em").unwrap();
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct NovelCount {
    pub word_count: i32,
    pub read_count: i32,
    pub reply_count: i32,
}

pub fn parse_count(doc: &Html) -> Option<NovelCount> {
    let mut count = doc.select(&SELECTOR_COUNT).next()?.text();
    let word_count = count.next()?.split('/').next()?;
    let read_count = count.next()?.split('/').next()?;
    let reply_count = count.next()?;
    let word_count = parse_num_with_unit(word_count)?;
    let read_count = parse_num_with_unit(read_count)?;
    let reply_count = parse_num_with_unit(reply_count)?;
    Some(NovelCount {
        word_count,
        read_count,
        reply_count,
    })
}
fn parse_num_with_unit(num: &str) -> Option<i32> {
    fn inner_parse(num: &str) -> IResult<&str, i32> {
        #[derive(Clone, Copy)]
        enum Flag {
            Qian,
            Wan,
        }
        let (input, (num, flag)) = tuple((
            float,
            opt(alt((
                value(Flag::Qian, tag("千")),
                value(Flag::Wan, tag("万")),
            ))),
        ))(num)?;
        let num = match flag {
            Some(Flag::Qian) => num * 1000f32,
            Some(Flag::Wan) => num * 10000f32,
            None => num,
        };
        Ok((input, num as i32))
    }
    let (_, num) = inner_parse(num).ok()?;
    Some(num)
}
