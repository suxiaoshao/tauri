/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-24 19:33:52
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-28 06:47:06
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/store/migrations/v1/conversations.rs
 */
use crate::errors::ChatGPTResult;
use diesel::prelude::*;
use time::OffsetDateTime;

use super::schema::conversations;

#[derive(Queryable, AsChangeset, Debug)]
#[diesel(table_name = conversations)]
pub struct SqlConversationV1 {
    pub(in crate::store) id: i32,
    pub(in crate::store) folder_id: Option<i32>,
    pub(in crate::store) path: String,
    pub(in crate::store) title: String,
    pub(in crate::store) icon: String,
    pub(in crate::store) mode: String,
    pub(in crate::store) model: String,
    pub(in crate::store) temperature: f64,
    pub(in crate::store) top_p: f64,
    pub(in crate::store) n: i64,
    pub(in crate::store) max_tokens: Option<i64>,
    pub(in crate::store) presence_penalty: f64,
    pub(in crate::store) frequency_penalty: f64,
    pub(in crate::store) created_time: OffsetDateTime,
    pub(in crate::store) updated_time: OffsetDateTime,
    pub(in crate::store) info: Option<String>,
    pub(in crate::store) prompt: Option<String>,
}

impl SqlConversationV1 {
    pub fn find(id: i32, conn: &mut SqliteConnection) -> ChatGPTResult<Self> {
        conversations::table
            .find(id)
            .first::<Self>(conn)
            .map_err(|e| e.into())
    }
    pub fn query_without_folder(conn: &mut SqliteConnection) -> ChatGPTResult<Vec<Self>> {
        conversations::table
            .filter(conversations::folder_id.is_null())
            .load::<Self>(conn)
            .map_err(|e| e.into())
    }
    pub fn find_by_folder_id(
        folder_id: i32,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<Vec<Self>> {
        conversations::table
            .filter(conversations::folder_id.eq(folder_id))
            .load::<Self>(conn)
            .map_err(|e| e.into())
    }
    pub fn delete_by_id(id: i32, conn: &mut SqliteConnection) -> ChatGPTResult<()> {
        diesel::delete(conversations::table.find(id)).execute(conn)?;
        Ok(())
    }
    pub fn path_exists(path: &str, conn: &mut SqliteConnection) -> ChatGPTResult<bool> {
        let count = conversations::table
            .filter(conversations::path.eq(path))
            .count()
            .get_result::<i64>(conn)?;
        Ok(count > 0)
    }
    pub fn delete_by_path(path: &str, conn: &mut SqliteConnection) -> ChatGPTResult<()> {
        let path = format!("{}/%", path);
        diesel::delete(conversations::table.filter(conversations::path.like(path)))
            .execute(conn)?;
        Ok(())
    }
    pub fn find_by_path_pre(path: &str, conn: &mut SqliteConnection) -> ChatGPTResult<Vec<Self>> {
        let path = format!("{}/%", path);
        conversations::table
            .filter(conversations::path.like(path))
            .load::<Self>(conn)
            .map_err(|e| e.into())
    }
    pub fn all(conn: &mut SqliteConnection) -> ChatGPTResult<Vec<Self>> {
        conversations::table
            .load::<Self>(conn)
            .map_err(|e| e.into())
    }
}
