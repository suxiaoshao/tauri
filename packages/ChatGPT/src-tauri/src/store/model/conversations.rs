use super::super::schema::conversations;
use crate::errors::ChatGPTResult;
use diesel::prelude::*;
use time::OffsetDateTime;

#[derive(Queryable, serde::Serialize)]
pub struct Conversation {
    id: i32,
    title: String,
    mode: String,
    #[serde(rename = "createdTime")]
    created_time: i64,
    #[serde(rename = "updatedTime")]
    updated_time: i64,
    info: Option<String>,
    prompt: Option<String>,
}

#[derive(Insertable)]
#[diesel(table_name = conversations)]
pub struct NewConversation<'a> {
    title: &'a str,
    mode: &'a str,
    created_time: i64,
    updated_time: i64,
    info: Option<&'a str>,
    prompt: Option<&'a str>,
}

impl Conversation {
    pub fn insert(
        title: &str,
        mode: &str,
        info: Option<&str>,
        prompt: Option<&str>,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<()> {
        let time = OffsetDateTime::now_utc().unix_timestamp();
        diesel::insert_into(conversations::table)
            .values(NewConversation {
                title,
                mode,
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
            .load::<Conversation>(conn)?;
        Ok(data)
    }
}
