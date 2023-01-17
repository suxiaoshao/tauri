use super::schema::novel;
use super::schema::novel_tag;
use super::schema::tag;
use crate::fetch::parse_novel::{parse_count::NovelCount, Author, Novel, Title};
use crate::{fetch::parse_novel::parse_url::UrlWithName, store::get_conn};
use diesel::prelude::*;

#[derive(Insertable, Queryable, serde::Serialize)]
#[diesel(table_name = novel)]
pub struct NovelModel {
    pub id: i32,
    pub name: String,
    pub desc: String,
    pub is_limit: bool,
    pub latest_chapter_name: String,
    pub latest_chapter_id: i32,
    pub word_count: i32,
    pub read_count: i32,
    pub reply_count: i32,
    pub author_id: Option<i32>,
    pub author_name: String,
}

impl NovelModel {
    pub fn into_novel(self) -> anyhow::Result<Novel> {
        use super::schema::novel_tag::dsl as novel_tag_dsl;
        use super::schema::tag::dsl as tag_dsl;
        let conn = &mut get_conn()?.get()?;
        let tags = tag_dsl::tag
            .left_join(novel_tag_dsl::novel_tag.on(novel_tag_dsl::tag_id.eq_all(tag_dsl::name)))
            .filter(novel_tag_dsl::novel_id.eq(self.id))
            .select((tag_dsl::href, tag_dsl::name))
            .load::<TagModel>(conn)?;
        let novel = Novel {
            title: Title {
                name: self.name,
                id: self.id,
            },
            desc: self.desc,
            is_limit: self.is_limit,
            author: match self.author_id {
                Some(id) => Author::Known(Title {
                    name: self.author_name,
                    id,
                }),
                None => Author::Anonymous(self.author_name),
            },
            latest_chapter: Title {
                name: self.latest_chapter_name,
                id: self.latest_chapter_id,
            },
            count: NovelCount {
                word_count: self.word_count,
                read_count: self.read_count,
                reply_count: self.reply_count,
            },
            tags: tags
                .into_iter()
                .map(|t| UrlWithName {
                    name: t.name,
                    href: t.href,
                })
                .collect(),
        };
        Ok(novel)
    }
    pub fn query_with_tag(
        offset: i64,
        limit: i64,
        is_limit: bool,
        tag: String,
    ) -> anyhow::Result<Vec<Novel>> {
        use super::schema::novel::dsl;
        use super::schema::novel_tag::dsl as novel_tag_dsl;
        let conn = &mut get_conn()?.get()?;
        let data = dsl::novel
            .left_join(novel_tag_dsl::novel_tag.on(novel_tag_dsl::novel_id.eq_all(dsl::id)))
            .filter(dsl::is_limit.eq_all(is_limit))
            .filter(novel_tag_dsl::tag_id.eq_all(tag))
            .select((
                dsl::id,
                dsl::name,
                dsl::desc,
                dsl::is_limit,
                dsl::latest_chapter_name,
                dsl::latest_chapter_id,
                dsl::word_count,
                dsl::read_count,
                dsl::reply_count,
                dsl::author_id,
                dsl::author_name,
            ))
            .limit(limit)
            .offset(offset)
            .load::<Self>(conn)?;
        let data = data
            .into_iter()
            .map(|n| n.into_novel())
            .collect::<Result<Vec<_>, _>>()?;
        Ok(data)
    }
    pub fn query(offset: i64, limit: i64, is_limit: bool) -> anyhow::Result<Vec<Novel>> {
        use super::schema::novel::dsl;
        let conn = &mut get_conn()?.get()?;
        let data = dsl::novel
            .filter(dsl::is_limit.eq_all(is_limit))
            .limit(limit)
            .offset(offset)
            .load::<Self>(conn)?;
        let data = data
            .into_iter()
            .map(|n| n.into_novel())
            .collect::<Result<Vec<_>, _>>()?;
        Ok(data)
    }
}

impl From<crate::fetch::parse_novel::Novel> for NovelModel {
    fn from(value: crate::fetch::parse_novel::Novel) -> Self {
        let (author_id, author_name) = match value.author {
            crate::fetch::parse_novel::Author::Anonymous(name) => (None, name),
            crate::fetch::parse_novel::Author::Known(Title { name, id }) => (Some(id), name),
        };
        Self {
            id: value.title.id,
            name: value.title.name,
            desc: value.desc,
            is_limit: value.is_limit,
            latest_chapter_name: value.latest_chapter.name,
            latest_chapter_id: value.latest_chapter.id,
            author_id,
            author_name,
            word_count: value.count.word_count,
            read_count: value.count.read_count,
            reply_count: value.count.reply_count,
        }
    }
}

#[derive(Queryable, Insertable, Debug)]
#[diesel(table_name = tag)]
pub struct TagModel {
    pub href: String,
    pub name: String,
}

impl TagModel {
    pub fn all_tags() -> anyhow::Result<Vec<String>> {
        use super::schema::tag::dsl::*;
        let conn = &mut get_conn()?.get()?;
        let data = tag.select(name).load::<String>(conn)?;
        Ok(data)
    }
}

impl From<&UrlWithName> for TagModel {
    fn from(value: &UrlWithName) -> Self {
        Self {
            href: value.href.clone(),
            name: value.name.clone(),
        }
    }
}

#[derive(Queryable, Insertable)]
#[diesel(table_name = novel_tag)]
pub struct NovelTagModel {
    pub novel_id: i32,
    pub tag_id: String,
}
