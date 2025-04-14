use super::utils::{deserialize_offset_date_time, serialize_offset_date_time};
use crate::{
    errors::{ChatGPTError, ChatGPTResult},
    plugins::TemporaryMessage,
    store::{
        Role, Status,
        model::{SqlConversation, SqlMessage, SqlNewMessage},
    },
};
use diesel::SqliteConnection;
use serde::{Deserialize, Serialize};
use std::ops::AddAssign;
use time::OffsetDateTime;

#[derive(Debug, Serialize, Clone, Deserialize, PartialEq, Eq)]
#[serde(tag = "tag", content = "value", rename_all = "camelCase")]
pub enum Content {
    Text(String),
    Extension {
        source: String,
        #[serde(rename = "extensionName")]
        extension_name: String,
        content: String,
    },
}

impl AddAssign<String> for Content {
    fn add_assign(&mut self, rhs: String) {
        match self {
            Content::Text(text) => {
                *text += &rhs;
            }
            Content::Extension { source, .. } => {
                *source += &rhs;
            }
        }
    }
}

impl AddAssign<&str> for Content {
    fn add_assign(&mut self, rhs: &str) {
        match self {
            Content::Text(text) => {
                *text += rhs;
            }
            Content::Extension { source, .. } => {
                *source += rhs;
            }
        }
    }
}

impl Content {
    pub(crate) fn send_content(&self) -> &str {
        match self {
            Content::Text(content) => content,
            Content::Extension { content, .. } => content,
        }
    }
}

#[derive(Debug, Serialize, Clone, Deserialize, PartialEq, Eq)]
pub struct Message {
    pub id: i32,
    #[serde(rename = "conversationId")]
    pub conversation_id: i32,
    #[serde(rename = "conversationPath")]
    pub conversation_path: String,
    pub role: Role,
    pub content: Content,
    pub status: Status,
    #[serde(
        rename = "createdTime",
        serialize_with = "serialize_offset_date_time",
        deserialize_with = "deserialize_offset_date_time"
    )]
    pub created_time: OffsetDateTime,
    #[serde(
        rename = "updatedTime",
        serialize_with = "serialize_offset_date_time",
        deserialize_with = "deserialize_offset_date_time"
    )]
    pub updated_time: OffsetDateTime,
    #[serde(
        rename = "startTime",
        serialize_with = "serialize_offset_date_time",
        deserialize_with = "deserialize_offset_date_time"
    )]
    pub start_time: OffsetDateTime,
    #[serde(
        rename = "endTime",
        serialize_with = "serialize_offset_date_time",
        deserialize_with = "deserialize_offset_date_time"
    )]
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
            content: serde_json::from_str(&value.content)?,
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
    pub content: Content,
    pub status: Status,
}

impl NewMessage {
    pub fn new(conversation_id: i32, role: Role, content: Content, status: Status) -> Self {
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
        conn.immediate_transaction(|conn| {
            let time = OffsetDateTime::now_utc();
            let SqlConversation { path, .. } = SqlConversation::find(conversation_id, conn)?;

            let new_message = SqlNewMessage {
                conversation_id,
                conversation_path: path,
                role: role.to_string(),
                content: serde_json::to_string(&content)?,
                status: status.to_string(),
                created_time: time,
                updated_time: time,
                start_time: time,
                end_time: time,
            };
            new_message.insert(conn)?;
            let message = SqlMessage::last(conn)?;
            Message::try_from(message)
        })
    }
    pub fn insert_many(
        messages: Vec<TemporaryMessage>,
        path: String,
        conversation_id: i32,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<()> {
        let messages = messages
            .into_iter()
            .map(
                |TemporaryMessage {
                     role,
                     content,
                     created_time,
                     updated_time,
                     start_time,
                     end_time,
                     status,
                     ..
                 }| {
                    Ok(SqlNewMessage {
                        conversation_id,
                        conversation_path: path.clone(),
                        role: role.to_string(),
                        content: serde_json::to_string(&content)?,
                        status: status.to_string(),
                        created_time,
                        updated_time,
                        start_time,
                        end_time,
                    })
                },
            )
            .collect::<Result<Vec<_>, ChatGPTError>>()?;
        SqlNewMessage::insert_many(&messages, conn)?;
        Ok(())
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
    pub fn add_content(
        id: i32,
        new_content: String,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<()> {
        let time = OffsetDateTime::now_utc();
        let SqlMessage { content, .. } = SqlMessage::find(id, conn)?;
        let mut content = serde_json::from_str::<Content>(&content)?;
        content += new_content;
        SqlMessage::add_content(id, serde_json::to_string(&content)?, time, conn)?;
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
    pub fn update_path(
        old_path_pre: &str,
        new_path_pre: &str,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<()> {
        let update_list = SqlMessage::find_by_path_pre(old_path_pre, conn)?;
        let time = OffsetDateTime::now_utc();
        update_list.into_iter().try_for_each(
            |SqlMessage {
                 id,
                 conversation_path,
                 ..
             }| {
                SqlMessage::update_path(
                    id,
                    conversation_path,
                    old_path_pre,
                    new_path_pre,
                    time,
                    conn,
                )?;
                Ok::<(), ChatGPTError>(())
            },
        )?;
        Ok(())
    }
    pub fn delete(id: i32, conn: &mut SqliteConnection) -> ChatGPTResult<()> {
        SqlMessage::delete(id, conn)?;
        Ok(())
    }
    pub fn update_content(
        id: i32,
        content: &Content,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<()> {
        let time = OffsetDateTime::now_utc();
        SqlMessage::update_content(id, serde_json::to_string(content)?, time, conn)?;
        Ok(())
    }
}
