/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-01-07 19:25:25
 * @FilePath: /tauri/packages/feiwen/src-tauri/src/fetch/parse_novel/parse_count.rs
 */
use nom::{
    branch::alt,
    bytes::complete::tag,
    combinator::{opt, value},
    number::complete::float,
    sequence::tuple,
    IResult,
};
use once_cell::sync::Lazy;
use scraper::{Html, Selector};

use crate::{
    errors::{FeiwenError, FeiwenResult},
    store::types::NovelCount,
};
static SELECTOR_COUNT: Lazy<Selector> = Lazy::new(|| {
    Selector::parse("div.col-xs-12.h5.brief-0 > span.pull-right.smaller-30 > em").unwrap()
});

pub fn parse_count(doc: &Html) -> FeiwenResult<NovelCount> {
    let mut count = doc
        .select(&SELECTOR_COUNT)
        .next()
        .ok_or(FeiwenError::CountParse)?
        .text();
    let word_count = count
        .next()
        .ok_or(FeiwenError::WordCountParse)?
        .split('/')
        .next()
        .ok_or(FeiwenError::WordCountParse)?;
    let read_count = count
        .next()
        .ok_or(FeiwenError::ReadCountParse)?
        .split('/')
        .next()
        .ok_or(FeiwenError::ReadCountParse)?;
    let reply_count = count.next().ok_or(FeiwenError::ReplyCountParse)?;
    let word_count = parse_num_with_unit(word_count)?;
    let read_count = parse_num_with_unit(read_count)?;
    let reply_count = parse_num_with_unit(reply_count)?;
    Ok(NovelCount {
        word_count,
        read_count,
        reply_count,
    })
}
fn parse_num_with_unit(num: &str) -> FeiwenResult<i32> {
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
    let (_, num) = inner_parse(num).map_err(|err| FeiwenError::CountUintParse(err.to_string()))?;
    Ok(num)
}
