use diesel::prelude::*;
use time::OffsetDateTime;

use crate::errors::ChatGPTResult;

use super::schema::messages;

#[derive(Debug, Queryable, Insertable)]
#[diesel(table_name = messages)]
pub struct SqlMessageV2 {
    pub id: i32,
    pub conversation_id: i32,
    pub(in crate::store) conversation_path: String,
    pub role: String,
    pub content: String,
    pub status: String,
    pub created_time: OffsetDateTime,
    pub updated_time: OffsetDateTime,
    pub start_time: OffsetDateTime,
    pub end_time: OffsetDateTime,
}

impl SqlMessageV2 {
    pub fn all(conn: &mut SqliteConnection) -> ChatGPTResult<Vec<Self>> {
        messages::table.load::<Self>(conn).map_err(|e| e.into())
    }
}
