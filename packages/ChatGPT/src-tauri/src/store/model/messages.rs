use diesel::prelude::*;
use time::OffsetDateTime;

use crate::{
    errors::ChatGPTResult,
    store::{schema::messages, types::Status},
};

#[derive(Insertable)]
#[diesel(table_name = messages)]
pub struct SqlNewMessage {
    pub(in super::super) conversation_id: i32,
    pub(in super::super) conversation_path: String,
    pub(in super::super) role: String,
    pub(in super::super) content: String,
    pub(in super::super) status: String,
    pub(in super::super) created_time: OffsetDateTime,
    pub(in super::super) updated_time: OffsetDateTime,
    pub(in super::super) start_time: OffsetDateTime,
    pub(in super::super) end_time: OffsetDateTime,
}

impl SqlNewMessage {
    pub fn insert(&self, conn: &mut SqliteConnection) -> ChatGPTResult<()> {
        diesel::insert_into(messages::table)
            .values(self)
            .execute(conn)?;
        Ok(())
    }
}

#[derive(Debug, Queryable)]
pub struct SqlMessage {
    pub id: i32,
    pub conversation_id: i32,
    pub(in super::super) conversation_path: String,
    pub role: String,
    pub content: String,
    pub status: String,
    pub created_time: OffsetDateTime,
    pub updated_time: OffsetDateTime,
    pub start_time: OffsetDateTime,
    pub end_time: OffsetDateTime,
}

impl SqlMessage {
    pub fn last(conn: &mut SqliteConnection) -> ChatGPTResult<Self> {
        messages::table
            .order(messages::id.desc())
            .first(conn)
            .map_err(|e| e.into())
    }
    pub fn query_by_conversation_id(
        conversation_id: i32,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<Vec<Self>> {
        messages::table
            .filter(messages::conversation_id.eq(conversation_id))
            .load(conn)
            .map_err(|e| e.into())
    }
    pub fn add_content(
        id: i32,
        content: String,
        time: OffsetDateTime,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<()> {
        diesel::update(messages::table.filter(messages::id.eq(id)))
            .set((
                messages::content.eq(messages::content.concat(content)),
                messages::updated_time.eq(time),
                messages::end_time.eq(time),
            ))
            .execute(conn)?;
        Ok(())
    }
    pub fn update_status(
        id: i32,
        status: Status,
        time: OffsetDateTime,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<()> {
        diesel::update(messages::table.filter(messages::id.eq(id)))
            .set((
                messages::status.eq(status.to_string()),
                messages::updated_time.eq(time),
                messages::end_time.eq(time),
            ))
            .execute(conn)?;
        Ok(())
    }
    pub fn find(id: i32, conn: &mut SqliteConnection) -> ChatGPTResult<Self> {
        messages::table
            .filter(messages::id.eq(id))
            .first(conn)
            .map_err(|e| e.into())
    }
    pub fn delete_by_conversation_id(
        conversation_id: i32,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<()> {
        diesel::delete(messages::table.filter(messages::conversation_id.eq(conversation_id)))
            .execute(conn)?;
        Ok(())
    }
    pub fn delete_by_path(path: &str, conn: &mut SqliteConnection) -> ChatGPTResult<()> {
        let path = format!("{}/%", path);
        diesel::delete(messages::table.filter(messages::conversation_path.like(path)))
            .execute(conn)?;
        Ok(())
    }
}
