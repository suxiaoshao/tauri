use super::super::schema::conversations;
use crate::{
    errors::ChatGPTResult,
    store::{types::Mode, Message},
};
use diesel::prelude::*;
use time::OffsetDateTime;

#[derive(serde::Serialize)]
pub struct Conversation {
    id: i32,
    title: String,
    mode: Mode,
    model: String,
    #[serde(rename = "createdTime")]
    created_time: OffsetDateTime,
    #[serde(rename = "updatedTime")]
    updated_time: OffsetDateTime,
    temperature: f64,
    top_p: f64,
    n: i64,
    #[serde(rename = "maxTokens")]
    max_tokens: Option<i64>,
    #[serde(rename = "presencePenalty")]
    presence_penalty: f64,
    #[serde(rename = "frequencyPenalty")]
    frequency_penalty: f64,
    info: Option<String>,
    prompt: Option<String>,
    messages: Vec<Message>,
}

#[derive(serde::Deserialize, Debug)]
pub struct NewConversation {
    title: String,
    mode: Mode,
    model: String,
    temperature: f64,
    top_p: f64,
    n: i64,
    max_tokens: Option<i64>,
    presence_penalty: f64,
    frequency_penalty: f64,
    info: Option<String>,
    prompt: Option<String>,
}

#[derive(Insertable)]
#[diesel(table_name = conversations)]
struct SqlNewConversation {
    title: String,
    mode: String,
    model: String,
    temperature: f64,
    top_p: f64,
    n: i64,
    max_tokens: Option<i64>,
    presence_penalty: f64,
    frequency_penalty: f64,
    created_time: OffsetDateTime,
    updated_time: OffsetDateTime,
    info: Option<String>,
    prompt: Option<String>,
}

#[derive(Queryable)]
struct SqlConversation {
    id: i32,
    title: String,
    mode: String,
    model: String,
    temperature: f64,
    top_p: f64,
    n: i64,
    max_tokens: Option<i64>,
    presence_penalty: f64,
    frequency_penalty: f64,
    created_time: OffsetDateTime,
    updated_time: OffsetDateTime,
    info: Option<String>,
    prompt: Option<String>,
}

impl Conversation {
    pub fn find(id: i32, conn: &mut SqliteConnection) -> ChatGPTResult<Self> {
        let sql_conversation = conversations::table
            .find(id)
            .first::<SqlConversation>(conn)?;
        Self::from_sql_conversation(sql_conversation, conn)
    }
    pub fn insert(
        NewConversation {
            title,
            mode,
            model,
            temperature,
            top_p,
            n,
            max_tokens,
            presence_penalty,
            frequency_penalty,
            info,
            prompt,
        }: NewConversation,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<()> {
        let time = OffsetDateTime::now_local()?;

        diesel::insert_into(conversations::table)
            .values(SqlNewConversation {
                title,
                mode: mode.to_string(),
                model,
                temperature,
                top_p,
                n,
                max_tokens,
                presence_penalty,
                frequency_penalty,
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
            model,
            temperature,
            top_p,
            n,
            max_tokens,
            presence_penalty,
            frequency_penalty,
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
            model,
            temperature,
            top_p,
            n,
            max_tokens,
            presence_penalty,
            frequency_penalty,
            created_time,
            updated_time,
            info,
            prompt,
            messages,
        })
    }
}
