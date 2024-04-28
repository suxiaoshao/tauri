/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-24 19:33:52
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-28 06:34:12
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/store/migrations/v1/folders.rs
 */
use crate::errors::ChatGPTResult;

use diesel::prelude::*;
use time::OffsetDateTime;

use super::schema::folders;

#[derive(Queryable, Debug)]
pub struct SqlFolderV1 {
    pub(in crate::store) id: i32,
    pub(in crate::store) name: String,
    pub(in crate::store) path: String,
    pub(in crate::store) parent_id: Option<i32>,
    pub(in crate::store) created_time: OffsetDateTime,
    pub(in crate::store) updated_time: OffsetDateTime,
}

impl SqlFolderV1 {
    pub fn all(conn: &mut SqliteConnection) -> ChatGPTResult<Vec<Self>> {
        let sql_folders = folders::table.load::<SqlFolderV1>(conn)?;
        Ok(sql_folders)
    }
}
