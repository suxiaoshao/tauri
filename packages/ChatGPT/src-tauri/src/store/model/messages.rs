use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use time::OffsetDateTime;

use crate::{
    errors::{ChatGPTError, ChatGPTResult},
    store::{
        schema::messages,
        types::{Role, Status},
    },
};

#[derive(Debug, Queryable, Serialize)]
pub struct Message {
    pub id: i32,
    pub conversation_id: i32,
    pub role: Role,
    pub content: String,
    pub status: Status,
    #[serde(rename = "createdTime")]
    pub created_time: OffsetDateTime,
    #[serde(rename = "updatedTime")]
    pub updated_time: OffsetDateTime,
    #[serde(rename = "startTime")]
    pub start_time: OffsetDateTime,
    #[serde(rename = "endTime")]
    pub end_time: OffsetDateTime,
}
#[derive(Deserialize, Debug)]
pub struct NewMessage {
    pub role: Role,
    pub content: String,
    pub status: Status,
}

impl NewMessage {
    pub fn new(role: Role, content: String, status: Status) -> Self {
        Self {
            role,
            content,
            status,
        }
    }
}

#[derive(Insertable)]
#[diesel(table_name = messages)]
struct SqlNewMessage {
    role: String,
    content: String,
    status: String,
    created_time: OffsetDateTime,
    updated_time: OffsetDateTime,
    start_time: OffsetDateTime,
    end_time: OffsetDateTime,
}

#[derive(Debug, Queryable)]
pub struct SqlMessage {
    pub id: i32,
    pub conversation_id: i32,
    pub role: String,
    pub content: String,
    pub status: String,
    pub created_time: OffsetDateTime,
    pub updated_time: OffsetDateTime,
    pub start_time: OffsetDateTime,
    pub end_time: OffsetDateTime,
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
    ) -> ChatGPTResult<Message> {
        let time = OffsetDateTime::now_local()?;

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
        let message: SqlMessage = messages::table.order(messages::id.desc()).first(conn)?;
        Message::try_from(message)
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
