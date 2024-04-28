/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-24 19:33:52
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-28 06:36:02
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/store/migrations/v1/messages.rs
 */
use diesel::prelude::*;
use time::OffsetDateTime;

use crate::{errors::ChatGPTResult, store::schema::messages};
#[derive(Debug, Queryable)]
pub struct SqlMessageV1 {
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

impl SqlMessageV1 {
    pub fn all(conn: &mut SqliteConnection) -> ChatGPTResult<Vec<Self>> {
        messages::table
            .load::<SqlMessageV1>(conn)
            .map_err(|e| e.into())
    }
}
