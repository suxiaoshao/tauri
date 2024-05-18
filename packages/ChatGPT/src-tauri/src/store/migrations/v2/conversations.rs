use super::schema::conversations;
use crate::errors::ChatGPTResult;
use diesel::prelude::*;
use time::OffsetDateTime;

#[derive(Queryable, AsChangeset, Debug, Insertable)]
#[diesel(table_name = conversations)]
pub struct SqlConversationV2 {
    pub(in crate::store) id: i32,
    pub(in crate::store) folder_id: Option<i32>,
    pub(in crate::store) path: String,
    pub(in crate::store) title: String,
    pub(in crate::store) icon: String,
    pub(in crate::store) created_time: OffsetDateTime,
    pub(in crate::store) updated_time: OffsetDateTime,
    pub(in crate::store) info: Option<String>,
    pub(in crate::store) template_id: i32,
}

impl SqlConversationV2 {
    pub fn all(conn: &mut SqliteConnection) -> ChatGPTResult<Vec<Self>> {
        conversations::table
            .load::<Self>(conn)
            .map_err(|e| e.into())
    }
}
