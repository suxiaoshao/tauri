use crate::errors::FeiwenResult;

use super::super::schema::novel_tag;
use diesel::prelude::*;

#[derive(Queryable, Insertable)]
#[diesel(table_name = novel_tag)]
pub struct NovelTagModel {
    pub novel_id: i32,
    pub tag_id: String,
}

impl NovelTagModel {
    pub fn save(tags: Vec<Self>, conn: &mut SqliteConnection) -> FeiwenResult<()> {
        diesel::insert_or_ignore_into(novel_tag::table)
            .values(tags)
            .execute(conn)?;
        Ok(())
    }
}
