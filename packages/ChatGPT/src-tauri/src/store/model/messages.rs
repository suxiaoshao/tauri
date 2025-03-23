use diesel::prelude::*;
use time::OffsetDateTime;

use crate::{
    errors::ChatGPTResult,
    store::{
        migrations::{v1::SqlMessageV1, v2::SqlMessageV2},
        schema::messages,
        types::Status,
    },
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
    pub fn insert_many(data: &[Self], conn: &mut SqliteConnection) -> ChatGPTResult<()> {
        diesel::insert_into(messages::table)
            .values(data)
            .execute(conn)?;
        Ok(())
    }
}

#[derive(Debug, Queryable, Insertable)]
#[diesel(table_name = messages)]
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

impl From<SqlMessageV1> for SqlMessage {
    fn from(
        SqlMessageV1 {
            id,
            conversation_id,
            conversation_path,
            role,
            content,
            status,
            created_time,
            updated_time,
            start_time,
            end_time,
        }: SqlMessageV1,
    ) -> Self {
        Self {
            id,
            conversation_id,
            conversation_path,
            role,
            content,
            status,
            created_time,
            updated_time,
            start_time,
            end_time,
        }
    }
}

impl From<SqlMessageV2> for SqlMessage {
    fn from(
        SqlMessageV2 {
            id,
            conversation_id,
            conversation_path,
            role,
            content,
            status,
            created_time,
            updated_time,
            start_time,
            end_time,
        }: SqlMessageV2,
    ) -> Self {
        Self {
            id,
            conversation_id,
            conversation_path,
            role,
            content,
            status,
            created_time,
            updated_time,
            start_time,
            end_time,
        }
    }
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
    pub fn find_by_path_pre(path: &str, conn: &mut SqliteConnection) -> ChatGPTResult<Vec<Self>> {
        let path = format!("{}/%", path);
        messages::table
            .filter(messages::conversation_path.like(path))
            .load::<Self>(conn)
            .map_err(|e| e.into())
    }
    pub fn update_path(
        id: i32,
        mut path: String,
        old_path_pre: &str,
        new_path_pre: &str,
        time: OffsetDateTime,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<()> {
        path.replace_range(0..old_path_pre.len(), new_path_pre);
        diesel::update(messages::table.filter(messages::id.eq(id)))
            .set((
                messages::conversation_path.eq(path),
                messages::updated_time.eq(time),
            ))
            .execute(conn)?;
        Ok(())
    }
    pub fn move_folder(
        conversation_id: i32,
        path: &str,
        time: OffsetDateTime,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<()> {
        diesel::update(messages::table)
            .filter(messages::conversation_id.eq(conversation_id))
            .set((
                messages::conversation_path.eq(path),
                messages::updated_time.eq(time),
            ))
            .execute(conn)?;
        Ok(())
    }
    pub fn delete(id: i32, conn: &mut SqliteConnection) -> ChatGPTResult<()> {
        diesel::delete(messages::table.filter(messages::id.eq(id))).execute(conn)?;
        Ok(())
    }
    pub fn update_content(
        id: i32,
        content: String,
        time: OffsetDateTime,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<()> {
        diesel::update(messages::table.filter(messages::id.eq(id)))
            .set((
                messages::content.eq(content),
                messages::updated_time.eq(time),
            ))
            .execute(conn)?;
        Ok(())
    }
    pub fn migration_save(data: Vec<SqlMessage>, conn: &mut SqliteConnection) -> ChatGPTResult<()> {
        diesel::insert_into(messages::table)
            .values(data)
            .execute(conn)?;
        Ok(())
    }
}
