use crate::errors::ChatGPTResult;

use super::schema::folders;
use diesel::prelude::*;
use time::OffsetDateTime;

#[derive(Queryable, Debug, Insertable)]
#[diesel(table_name = folders)]
pub struct SqlFolderV2 {
    pub(in crate::store) id: i32,
    pub(in crate::store) name: String,
    pub(in crate::store) path: String,
    pub(in crate::store) parent_id: Option<i32>,
    pub(in crate::store) created_time: OffsetDateTime,
    pub(in crate::store) updated_time: OffsetDateTime,
}

impl SqlFolderV2 {
    pub fn all(conn: &mut SqliteConnection) -> ChatGPTResult<Vec<Self>> {
        let sql_folders = folders::table.load::<SqlFolderV2>(conn)?;
        Ok(sql_folders)
    }
}
