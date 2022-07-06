use crate::errors::MovieErrors;
use crate::MovieResult;
use once_cell::sync::Lazy;
use scraper::{ElementRef, Html, Selector};
use serde::{Deserialize, Serialize};
use std::{collections::HashSet, fmt::Debug};

static SELECTOR_ITEM: Lazy<Selector> =
    Lazy::new(|| Selector::parse("#content > div > div.article > ol > li > div").unwrap());
static SELECTOR_IMAGE: Lazy<Selector> = Lazy::new(|| Selector::parse("div.pic > a > img").unwrap());
static SELECTOR_TITLE: Lazy<Selector> =
    Lazy::new(|| Selector::parse("div.info > div.hd > a").unwrap());
static SELECTOR_TITLE_NAME: Lazy<Selector> = Lazy::new(|| Selector::parse("span").unwrap());
static SELECTOR_INFO: Lazy<Selector> =
    Lazy::new(|| Selector::parse("div.info > div.bd > p:nth-child(1)").unwrap());

pub(crate) fn parse_page(body: String) -> MovieResult<Vec<Movie>> {
    let document = Html::parse_document(&body);
    let items = document
        .select(&SELECTOR_ITEM)
        .map(|item| parse_item(&item))
        .collect::<MovieResult<Vec<_>>>()?;

    Ok(items)
}
#[derive(Debug, Serialize, Deserialize)]
pub(crate) struct Movie {
    pub image: String,
    pub href: String,
    pub name: Vec<String>,
    pub year: u32,
    pub area: HashSet<String>,
    pub tags: HashSet<String>,
    pub director: HashSet<String>,
    pub actor: HashSet<String>,
}

fn parse_item(item: &ElementRef) -> MovieResult<Movie> {
    let image = parse_image(item)?;
    let title = parse_title(item)?;
    let (info, staff) = parse_info(item)?;
    Ok(Movie {
        image,
        href: title.href,
        name: title.name,
        year: info.year,
        area: info.area,
        tags: info.tags,
        director: staff.director,
        actor: staff.actor,
    })
}

fn parse_image(item: &ElementRef) -> MovieResult<String> {
    let image = item
        .select(&SELECTOR_IMAGE)
        .next()
        .ok_or(MovieErrors::SelectNotFound)?
        .value()
        .attr("src")
        .ok_or(MovieErrors::AttrNotFound)?
        .to_string();
    Ok(image)
}
#[derive(Debug)]
pub(crate) struct Title {
    href: String,
    name: Vec<String>,
}

fn parse_title(item: &ElementRef) -> MovieResult<Title> {
    let title = item
        .select(&SELECTOR_TITLE)
        .next()
        .ok_or(MovieErrors::SelectNotFound)?;
    let href = title
        .value()
        .attr("href")
        .ok_or(MovieErrors::AttrNotFound)?
        .to_string();
    let name = title
        .select(&SELECTOR_TITLE_NAME)
        .map(|x| to_string(x).replace(" / ", ""))
        .collect();
    Ok(Title { href, name })
}

fn to_string(text: ElementRef) -> String {
    text.text().fold("".to_string(), |mut acc, x| {
        acc.push_str(x);
        acc
    })
}

#[derive(Debug)]
struct Info {
    year: u32,
    area: HashSet<String>,
    tags: HashSet<String>,
}
#[derive(Debug)]
struct Staff {
    director: HashSet<String>,
    actor: HashSet<String>,
}

fn parse_info(item: &ElementRef) -> MovieResult<(Info, Staff)> {
    let mut info = item
        .select(&SELECTOR_INFO)
        .next()
        .ok_or(MovieErrors::SelectNotFound)?
        .text();
    let staff = info.next().ok_or(MovieErrors::SelectNotFound)?;
    let staff = parse_staff(staff)?;
    let info = info.next().ok_or(MovieErrors::SelectNotFound)?;
    let info = parse_info_detail(info)?;
    Ok((info, staff))
}

fn parse_staff(item: &str) -> MovieResult<Staff> {
    let item = item.replace(' ', "");
    let mut item = item.split("   ");
    let director = parse_people(item.next().ok_or(MovieErrors::ParseError)?)?;
    let actor = match item.next() {
        Some(data) => parse_people(data)?,
        None => Default::default(),
    };
    Ok(Staff { director, actor })
}
fn parse_people(item: &str) -> MovieResult<HashSet<String>> {
    let item = item.rsplit(':').next().ok_or(MovieErrors::ParseError)?;
    let result = item.split('/').map(|x| x.to_string()).collect();
    Ok(result)
}
fn parse_info_detail(item: &str) -> MovieResult<Info> {
    let mut item = item.trim().rsplit(" / ");
    let tags = item
        .next()
        .ok_or(MovieErrors::ParseError)?
        .split(' ')
        .map(|x| x.to_string())
        .collect();
    let area = item
        .next()
        .ok_or(MovieErrors::ParseError)?
        .split(' ')
        .map(|x| x.to_string())
        .collect();
    let year = item
        .next()
        .ok_or(MovieErrors::ParseError)?
        .split('(')
        .next()
        .ok_or(MovieErrors::ParseError)?
        .parse::<u32>()?;

    Ok(Info { year, area, tags })
}
