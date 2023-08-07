use diesel::prelude::*;
use time::OffsetDateTime;

use crate::{
    errors::{ChatGPTError, ChatGPTResult},
    store::schema::messages,
};

use super::types::{Role, Status};

#[derive(Debug, Queryable, serde::Serialize)]
pub struct Message {
    pub id: i32,
    pub conversation_id: i32,
    pub role: Role,
    pub content: String,
    pub status: Status,
    #[serde(rename = "createdTime")]
    pub created_time: i64,
    #[serde(rename = "updatedTime")]
    pub updated_time: i64,
    #[serde(rename = "startTime")]
    pub start_time: i64,
    #[serde(rename = "endTime")]
    pub end_time: i64,
}
#[derive(serde::Deserialize, Debug)]
pub struct NewMessage {
    pub role: Role,
    pub content: String,
    pub status: Status,
}

#[derive(Insertable)]
#[diesel(table_name = messages)]
struct SqlNewMessage {
    role: String,
    content: String,
    status: String,
    created_time: i64,
    updated_time: i64,
    start_time: i64,
    end_time: i64,
}

#[derive(Debug, Queryable)]
pub struct SqlMessage {
    pub id: i32,
    pub conversation_id: i32,
    pub role: String,
    pub content: String,
    pub status: String,
    pub created_time: i64,
    pub updated_time: i64,
    pub start_time: i64,
    pub end_time: i64,
}

impl TryFrom<SqlMessage> for Message {
    type Error = ChatGPTError;

    fn try_from(value: SqlMessage) -> Result<Self, Self::Error> {
        Ok(Message {
            id: value.id,
            conversation_id: value.conversation_id,
            role: value.role.parse()?,
            content: value.content,
            status: value.status.parse()?,
            created_time: value.created_time,
            updated_time: value.updated_time,
            start_time: value.start_time,
            end_time: value.end_time,
        })
    }
}

impl Message {
    pub fn insert(
        NewMessage {
            role,
            content,
            status,
        }: NewMessage,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<()> {
        let time = (OffsetDateTime::now_utc().unix_timestamp_nanos() / 1000) as i64;

        let new_message = SqlNewMessage {
            role: role.to_string(),
            content,
            status: status.to_string(),
            created_time: time,
            updated_time: time,
            start_time: time,
            end_time: time,
        };
        diesel::insert_into(messages::table)
            .values(&new_message)
            .execute(conn)?;
        Ok(())
    }
    pub fn messages_by_conversation_id(
        conversation_id: i32,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<Vec<Message>> {
        let messages: Vec<SqlMessage> = messages::table
            .filter(messages::conversation_id.eq(conversation_id))
            .load::<SqlMessage>(conn)?;
        messages
            .into_iter()
            .map(TryFrom::try_from)
            .collect::<ChatGPTResult<_>>()
    }
}
