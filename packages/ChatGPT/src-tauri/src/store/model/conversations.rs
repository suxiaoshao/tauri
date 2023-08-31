use super::super::schema::conversations;
use crate::errors::ChatGPTResult;
use diesel::prelude::*;
use time::OffsetDateTime;

#[derive(Insertable)]
#[diesel(table_name = conversations)]
pub struct SqlNewConversation {
    pub(in super::super) title: String,
    pub(in super::super) path: String,
    pub(in super::super) folder_id: Option<i32>,
    pub(in super::super) icon: String,
    pub(in super::super) mode: String,
    pub(in super::super) model: String,
    pub(in super::super) temperature: f64,
    pub(in super::super) top_p: f64,
    pub(in super::super) n: i64,
    pub(in super::super) max_tokens: Option<i64>,
    pub(in super::super) presence_penalty: f64,
    pub(in super::super) frequency_penalty: f64,
    pub(in super::super) created_time: OffsetDateTime,
    pub(in super::super) updated_time: OffsetDateTime,
    pub(in super::super) info: Option<String>,
    pub(in super::super) prompt: Option<String>,
}

impl SqlNewConversation {
    pub fn insert(self, conn: &mut SqliteConnection) -> ChatGPTResult<()> {
        diesel::insert_into(conversations::table)
            .values(self)
            .execute(conn)?;
        Ok(())
    }
}

#[derive(Queryable, AsChangeset, Debug)]
#[diesel(table_name = conversations)]
pub struct SqlConversation {
    pub(in super::super) id: i32,
    pub(in super::super) folder_id: Option<i32>,
    pub(in super::super) path: String,
    pub(in super::super) title: String,
    pub(in super::super) icon: String,
    pub(in super::super) mode: String,
    pub(in super::super) model: String,
    pub(in super::super) temperature: f64,
    pub(in super::super) top_p: f64,
    pub(in super::super) n: i64,
    pub(in super::super) max_tokens: Option<i64>,
    pub(in super::super) presence_penalty: f64,
    pub(in super::super) frequency_penalty: f64,
    pub(in super::super) created_time: OffsetDateTime,
    pub(in super::super) updated_time: OffsetDateTime,
    pub(in super::super) info: Option<String>,
    pub(in super::super) prompt: Option<String>,
}

impl SqlConversation {
    pub fn find(id: i32, conn: &mut SqliteConnection) -> ChatGPTResult<Self> {
        conversations::table
            .find(id)
            .first::<Self>(conn)
            .map_err(|e| e.into())
    }
    pub fn query_without_folder(conn: &mut SqliteConnection) -> ChatGPTResult<Vec<Self>> {
        conversations::table
            .filter(conversations::folder_id.is_null())
            .load::<Self>(conn)
            .map_err(|e| e.into())
    }
    pub fn find_by_folder_id(
        folder_id: i32,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<Vec<Self>> {
        conversations::table
            .filter(conversations::folder_id.eq(folder_id))
            .load::<Self>(conn)
            .map_err(|e| e.into())
    }
    pub fn delete_by_id(id: i32, conn: &mut SqliteConnection) -> ChatGPTResult<()> {
        diesel::delete(conversations::table.find(id)).execute(conn)?;
        Ok(())
    }
    pub fn path_exists(path: &str, conn: &mut SqliteConnection) -> ChatGPTResult<bool> {
        let count = conversations::table
            .filter(conversations::path.eq(path))
            .count()
            .get_result::<i64>(conn)?;
        Ok(count > 0)
    }
    pub fn delete_by_path(path: &str, conn: &mut SqliteConnection) -> ChatGPTResult<()> {
        let path = format!("{}/%", path);
        diesel::delete(conversations::table.filter(conversations::path.like(path)))
            .execute(conn)?;
        Ok(())
    }
}

#[derive(AsChangeset, Identifiable, Debug)]
#[diesel(table_name = conversations)]
pub struct UpdateConversation {
    pub(in super::super) id: i32,
    pub(in super::super) folder_id: Option<i32>,
    pub(in super::super) path: String,
    pub(in super::super) title: String,
    pub(in super::super) icon: String,
    pub(in super::super) mode: String,
    pub(in super::super) model: String,
    pub(in super::super) temperature: f64,
    pub(in super::super) top_p: f64,
    pub(in super::super) n: i64,
    pub(in super::super) max_tokens: Option<i64>,
    pub(in super::super) presence_penalty: f64,
    pub(in super::super) frequency_penalty: f64,
    pub(in super::super) updated_time: OffsetDateTime,
    pub(in super::super) info: Option<String>,
    pub(in super::super) prompt: Option<String>,
}

impl UpdateConversation {
    pub fn update(self, conn: &mut SqliteConnection) -> ChatGPTResult<()> {
        diesel::update(conversations::table)
            .filter(conversations::id.eq(self.id))
            .set(self)
            .execute(conn)?;
        Ok(())
    }
}
