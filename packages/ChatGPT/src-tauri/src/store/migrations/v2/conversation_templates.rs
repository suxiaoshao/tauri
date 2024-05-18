/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-26 19:18:35
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 02:15:54
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/store/model/conversation_templates.rs
 */
use crate::errors::ChatGPTResult;

use diesel::prelude::*;
use time::OffsetDateTime;

use super::schema::conversation_templates;

#[derive(Queryable, AsChangeset, Debug, Insertable)]
#[diesel(table_name = conversation_templates)]
pub struct SqlConversationTemplateV2 {
    pub(in crate::store) id: i32,
    pub(in crate::store) name: String,
    pub(in crate::store) icon: String,
    pub(in crate::store) description: Option<String>,
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
}

impl SqlConversationTemplateV2 {
    pub fn all(conn: &mut SqliteConnection) -> ChatGPTResult<Vec<Self>> {
        let data = conversation_templates::table.load::<Self>(conn)?;
        Ok(data)
    }
}
