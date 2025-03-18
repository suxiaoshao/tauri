/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-26 19:18:35
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 02:15:54
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/store/model/conversation_templates.rs
 */
use crate::errors::ChatGPTResult;

use super::super::schema::conversation_templates;
use diesel::prelude::*;
use time::OffsetDateTime;

#[derive(Insertable)]
#[diesel(table_name = conversation_templates)]
pub struct SqlNewConversationTemplate {
    pub(in super::super) name: String,
    pub(in super::super) icon: String,
    pub(in super::super) description: Option<String>,
    pub(in super::super) adapter: String,
    pub(in super::super) template: String,
    pub(in super::super) created_time: OffsetDateTime,
    pub(in super::super) updated_time: OffsetDateTime,
}

impl SqlNewConversationTemplate {
    pub fn default() -> Self {
        let now = OffsetDateTime::now_utc();
        todo!()
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
    pub(in super::super) description: Option<String>,
    pub(in super::super) adapter: String,
    pub(in super::super) template: String,
    pub(in super::super) created_time: OffsetDateTime,
    pub(in super::super) updated_time: OffsetDateTime,
}

impl SqlConversationTemplate {
    pub fn first(conn: &mut SqliteConnection) -> ChatGPTResult<Self> {
        let first = conversation_templates::table
            .order(conversation_templates::id.desc())
            .first::<Self>(conn)?;
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
    pub fn all(conn: &mut SqliteConnection) -> ChatGPTResult<Vec<Self>> {
        let data = conversation_templates::table.load::<Self>(conn)?;
        Ok(data)
    }
    pub fn delete_by_id(id: i32, conn: &mut SqliteConnection) -> ChatGPTResult<()> {
        diesel::delete(conversation_templates::table.find(id)).execute(conn)?;
        Ok(())
    }
}

#[derive(AsChangeset, Identifiable, Debug)]
#[diesel(table_name = conversation_templates)]
pub struct SqlUpdateConversationTemplate {
    pub(in super::super) id: i32,
    pub(in super::super) name: String,
    pub(in super::super) icon: String,
    pub(in super::super) description: Option<String>,
    pub(in super::super) adapter: String,
    pub(in super::super) template: String,
    pub(in super::super) updated_time: OffsetDateTime,
}

impl SqlUpdateConversationTemplate {
    pub fn update(self, conn: &mut SqliteConnection) -> ChatGPTResult<()> {
        diesel::update(conversation_templates::table.find(self.id))
            .set(self)
            .execute(conn)?;
        Ok(())
    }
}
