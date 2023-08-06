use super::{super::schema::conversations, types::Mode};
use crate::errors::{ChatGPTError, ChatGPTResult};
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

impl TryFrom<SqlConversation> for Conversation {
    type Error = ChatGPTError;

    fn try_from(value: SqlConversation) -> Result<Self, Self::Error> {
        Ok(Conversation {
            id: value.id,
            title: value.title,
            mode: value.mode.parse()?,
            created_time: value.created_time,
            updated_time: value.updated_time,
            info: value.info,
            prompt: value.prompt,
        })
    }
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
            .map(TryFrom::try_from)
            .collect::<ChatGPTResult<_>>()
    }
}
