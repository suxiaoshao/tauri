use super::{super::schema::conversations, types::Mode};
use crate::{errors::ChatGPTResult, store::Message};
use diesel::prelude::*;
use time::OffsetDateTime;

#[derive(serde::Serialize)]
pub struct Conversation {
    id: i32,
    title: String,
    mode: Mode,
    #[serde(rename = "createdTime")]
    created_time: i64,
    #[serde(rename = "updatedTime")]
    updated_time: i64,
    info: Option<String>,
    prompt: Option<String>,
    messages: Vec<Message>,
}

#[derive(serde::Deserialize, Debug)]
pub struct NewConversation {
    title: String,
    mode: Mode,
    info: Option<String>,
    prompt: Option<String>,
}

#[derive(Insertable)]
#[diesel(table_name = conversations)]
struct SqlNewConversation {
    title: String,
    mode: String,
    created_time: i64,
    updated_time: i64,
    info: Option<String>,
    prompt: Option<String>,
}

#[derive(Queryable)]
struct SqlConversation {
    id: i32,
    title: String,
    mode: String,
    created_time: i64,
    updated_time: i64,
    info: Option<String>,
    prompt: Option<String>,
}

impl Conversation {
    pub fn insert(
        NewConversation {
            title,
            mode,
            info,
            prompt,
        }: NewConversation,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<()> {
        let time = (OffsetDateTime::now_utc().unix_timestamp_nanos() / 1000) as i64;

        diesel::insert_into(conversations::table)
            .values(SqlNewConversation {
                title,
                mode: mode.to_string(),
                info,
                prompt,
                created_time: time,
                updated_time: time,
            })
            .execute(conn)?;
        Ok(())
    }
    /// 获取所有对话
    pub fn query_all(conn: &mut SqliteConnection) -> ChatGPTResult<Vec<Conversation>> {
        let data = conversations::table
            .order(conversations::updated_time.desc())
            .load::<SqlConversation>(conn)?;
        data.into_iter()
            .map(|sql_conversation| Self::from_sql_conversation(sql_conversation, conn))
            .collect::<ChatGPTResult<_>>()
    }
    fn from_sql_conversation(
        SqlConversation {
            id,
            title,
            mode,
            created_time,
            updated_time,
            info,
            prompt,
        }: SqlConversation,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<Conversation> {
        let messages = Message::messages_by_conversation_id(id, conn)?;
        Ok(Conversation {
            id,
            title,
            mode: mode.parse()?,
            created_time,
            updated_time,
            info,
            prompt,
            messages,
        })
    }
}
