use crate::{errors::ChatGPTResult, store::Mode};

/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-26 19:18:35
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-28 07:23:04
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/store/model/conversation_templates.rs
 */
use super::super::schema::conversation_templates;
use diesel::prelude::*;
use time::OffsetDateTime;

#[derive(Insertable)]
#[diesel(table_name = conversation_templates)]
pub struct SqlNewConversationTemplate {
    pub(in super::super) name: String,
    pub(in super::super) icon: String,
    pub(in super::super) mode: String,
    pub(in super::super) model: String,
    pub(in super::super) temperature: f64,
    pub(in super::super) top_p: f64,
    pub(in super::super) n: i64,
    pub(in super::super) max_tokens: Option<i64>,
    pub(in super::super) presence_penalty: f64,
    pub(in super::super) frequency_penalty: f64,
    pub(in super::super) created_time: OffsetDateTime,
    pub(in super::super) updated_time: OffsetDateTime,
}

impl SqlNewConversationTemplate {
    pub fn default() -> Self {
        let now = OffsetDateTime::now_utc();
        Self {
            name: "基础模板".to_string(),
            icon: "🤖".to_string(),
            mode: (Mode::Contextual).to_string(),
            model: "gpt-3.5-turbo".to_string(),
            temperature: 0.0,
            top_p: 1.0,
            n: 1,
            max_tokens: None,
            presence_penalty: 0.0,
            frequency_penalty: 0.0,
            created_time: now,
            updated_time: now,
        }
    }
    pub fn insert(self, conn: &mut SqliteConnection) -> ChatGPTResult<()> {
        diesel::insert_into(conversation_templates::table)
            .values(self)
            .execute(conn)?;
        Ok(())
    }
}

#[derive(Queryable, AsChangeset, Debug, Insertable)]
#[diesel(table_name = conversation_templates)]
pub struct SqlConversationTemplate {
    pub(in super::super) id: i32,
    pub(in super::super) name: String,
    pub(in super::super) icon: String,
    pub(in super::super) mode: String,
    pub(in super::super) model: String,
    pub(in super::super) temperature: f64,
    pub(in super::super) top_p: f64,
    pub(in super::super) n: i64,
    pub(in super::super) max_tokens: Option<i64>,
    pub(in super::super) presence_penalty: f64,
    pub(in super::super) frequency_penalty: f64,
    pub(in super::super) created_time: OffsetDateTime,
    pub(in super::super) updated_time: OffsetDateTime,
}

impl SqlConversationTemplate {
    pub fn first(conn: &mut SqliteConnection) -> ChatGPTResult<Self> {
        let first = conversation_templates::table.first::<Self>(conn)?;
        Ok(first)
    }
    pub fn migration_save(
        data: Vec<SqlConversationTemplate>,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<()> {
        diesel::insert_into(conversation_templates::table)
            .values(data)
            .execute(conn)?;
        Ok(())
    }
    pub fn find(id: i32, conn: &mut SqliteConnection) -> ChatGPTResult<Self> {
        let data = conversation_templates::table.find(id).first::<Self>(conn)?;
        Ok(data)
    }
}
