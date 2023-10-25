use crate::{errors::FeiwenResult, store::service::Tag};

use super::super::schema::tag;
use diesel::prelude::*;
#[derive(Queryable, Insertable, Debug)]
#[diesel(table_name = tag)]
pub struct TagModel {
    pub id: Option<i32>,
    pub name: String,
}

impl TagModel {
    pub fn all_tags(conn: &mut SqliteConnection) -> FeiwenResult<Vec<String>> {
        let data = tag::table.select(tag::name).load::<String>(conn)?;
        Ok(data)
    }
    pub fn save(tags: Vec<TagModel>, conn: &mut SqliteConnection) -> FeiwenResult<()> {
        diesel::insert_or_ignore_into(tag::table)
            .values(tags)
            .execute(conn)?;
        Ok(())
    }
}

impl From<&Tag> for TagModel {
    fn from(url: &Tag) -> Self {
        Self {
            id: url.id,
            name: url.name.clone(),
        }
    }
}

impl TagModel {}
