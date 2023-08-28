use crate::{errors::ChatGPTResult, store::Conversation};

use super::super::schema::folders;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};
use time::OffsetDateTime;

#[derive(Serialize)]
pub struct Folder {
    pub id: i32,
    pub name: String,
    #[serde(rename = "parentId")]
    pub parent_id: Option<i32>,
    #[serde(rename = "createdTime")]
    pub created_time: OffsetDateTime,
    #[serde(rename = "updatedTime")]
    pub updated_time: OffsetDateTime,
    pub conversations: Vec<Conversation>,
    pub folders: Vec<Folder>,
}

#[derive(Queryable)]
struct SqlFolder {
    id: i32,
    name: String,
    parent_id: Option<i32>,
    created_time: OffsetDateTime,
    updated_time: OffsetDateTime,
}

#[derive(Deserialize)]
pub struct NewFolder {
    name: String,
    parent_id: Option<i32>,
}

#[derive(Insertable)]
#[diesel(table_name = folders)]
struct SqlNewFolder {
    name: String,
    parent_id: Option<i32>,
    created_time: OffsetDateTime,
    updated_time: OffsetDateTime,
}

impl Folder {
    pub fn insert(
        NewFolder { name, parent_id }: NewFolder,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<()> {
        let now = OffsetDateTime::now_local()?;
        let new_folder = SqlNewFolder {
            name,
            parent_id,
            created_time: now,
            updated_time: now,
        };
        diesel::insert_into(folders::table)
            .values(new_folder)
            .execute(conn)?;
        Ok(())
    }
    pub fn query(conn: &mut SqliteConnection) -> ChatGPTResult<Vec<Self>> {
        let sql_folders = folders::table
            .filter(folders::parent_id.is_null())
            .order(folders::updated_time.desc())
            .load::<SqlFolder>(conn)?;
        sql_folders
            .into_iter()
            .map(|sql_folder| Self::from_sql_folder(sql_folder, conn))
            .collect()
    }
    fn from_sql_folder(
        SqlFolder {
            id,
            name,
            parent_id,
            created_time,
            updated_time,
        }: SqlFolder,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<Self> {
        let conversations = Conversation::find_by_folder_id(id, conn)?;
        let folders = Self::find_by_parent_id(id, conn)?;
        Ok(Self {
            id,
            name,
            parent_id,
            created_time,
            updated_time,
            conversations,
            folders,
        })
    }
    fn find_by_parent_id(parent_id: i32, conn: &mut SqliteConnection) -> ChatGPTResult<Vec<Self>> {
        let sql_folders = folders::table
            .filter(folders::parent_id.eq(parent_id))
            .load::<SqlFolder>(conn)?;
        sql_folders
            .into_iter()
            .map(|sql_folder| Self::from_sql_folder(sql_folder, conn))
            .collect()
    }
}
