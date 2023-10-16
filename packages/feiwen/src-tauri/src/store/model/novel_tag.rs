use super::super::schema::novel_tag;
use diesel::prelude::*;

#[derive(Queryable, Insertable)]
#[diesel(table_name = novel_tag)]
pub struct NovelTagModel {
    pub novel_id: i32,
    pub tag_id: String,
}
