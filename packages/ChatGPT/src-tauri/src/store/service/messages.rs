use diesel::SqliteConnection;
use serde::{Deserialize, Serialize};
use time::OffsetDateTime;

use crate::{
    errors::{ChatGPTError, ChatGPTResult},
    store::{
        model::{
            conversations::SqlConversation,
            messages::{SqlMessage, SqlNewMessage},
        },
        Role, Status,
    },
};

#[derive(Debug, Serialize, Clone, Deserialize, PartialEq, Eq)]
pub struct Message {
    pub id: i32,
    #[serde(rename = "conversationId")]
    pub conversation_id: i32,
    #[serde(rename = "conversationPath")]
    pub conversation_path: String,
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

impl TryFrom<SqlMessage> for Message {
    type Error = ChatGPTError;

    fn try_from(value: SqlMessage) -> Result<Self, Self::Error> {
        Ok(Message {
            id: value.id,
            conversation_id: value.conversation_id,
            conversation_path: value.conversation_path,
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

#[derive(Deserialize, Debug)]
pub struct NewMessage {
    pub conversation_id: i32,
    pub role: Role,
    pub content: String,
    pub status: Status,
}

impl NewMessage {
    pub fn new(conversation_id: i32, role: Role, content: String, status: Status) -> Self {
        Self {
            conversation_id,
            role,
            content,
            status,
        }
    }
}

impl Message {
    pub fn insert(
        NewMessage {
            conversation_id,
            role,
            content,
            status,
        }: NewMessage,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<Message> {
        let time = OffsetDateTime::now_utc();
        let SqlConversation { path, .. } = SqlConversation::find(conversation_id, conn)?;

        let new_message = SqlNewMessage {
            conversation_id,
            conversation_path: path,
            role: role.to_string(),
            content,
            status: status.to_string(),
            created_time: time,
            updated_time: time,
            start_time: time,
            end_time: time,
        };
        new_message.insert(conn)?;
        let message = SqlMessage::first(conn)?;
        Message::try_from(message)
    }
    pub fn messages_by_conversation_id(
        conversation_id: i32,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<Vec<Message>> {
        let messages = SqlMessage::query_by_conversation_id(conversation_id, conn)?;
        messages
            .into_iter()
            .map(TryFrom::try_from)
            .collect::<ChatGPTResult<_>>()
    }
    pub fn add_content(id: i32, content: String, conn: &mut SqliteConnection) -> ChatGPTResult<()> {
        let time = OffsetDateTime::now_utc();
        SqlMessage::add_content(id, content, time, conn)?;
        Ok(())
    }
    pub fn update_status(
        id: i32,
        status: Status,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<()> {
        let time = OffsetDateTime::now_utc();
        SqlMessage::update_status(id, status, time, conn)?;
        Ok(())
    }
    pub fn find(id: i32, conn: &mut SqliteConnection) -> ChatGPTResult<Message> {
        let message = SqlMessage::find(id, conn)?;
        Message::try_from(message)
    }
}
