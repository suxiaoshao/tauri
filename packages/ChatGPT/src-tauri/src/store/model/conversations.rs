use super::super::schema::conversations;
use crate::{errors::ChatGPTResult, store::migrations::v2::SqlConversationV2};
use diesel::prelude::*;
use time::OffsetDateTime;

#[derive(Insertable)]
#[diesel(table_name = conversations)]
pub struct SqlNewConversation {
    pub(in super::super) title: String,
    pub(in super::super) path: String,
    pub(in super::super) folder_id: Option<i32>,
    pub(in super::super) icon: String,
    pub(in super::super) created_time: OffsetDateTime,
    pub(in super::super) updated_time: OffsetDateTime,
    pub(in super::super) info: Option<String>,
    pub(in super::super) template_id: i32,
}

impl SqlNewConversation {
    pub fn insert(self, conn: &mut SqliteConnection) -> ChatGPTResult<()> {
        diesel::insert_into(conversations::table)
            .values(self)
            .execute(conn)?;
        Ok(())
    }
}

#[derive(Queryable, AsChangeset, Debug, Insertable)]
#[diesel(table_name = conversations)]
pub struct SqlConversation {
    pub(in super::super) id: i32,
    pub(in super::super) folder_id: Option<i32>,
    pub(in super::super) path: String,
    pub(in super::super) title: String,
    pub(in super::super) icon: String,
    pub(in super::super) created_time: OffsetDateTime,
    pub(in super::super) updated_time: OffsetDateTime,
    pub(in super::super) info: Option<String>,
    pub(in super::super) template_id: i32,
}

impl From<SqlConversationV2> for SqlConversation {
    fn from(
        SqlConversationV2 {
            id,
            folder_id,
            path,
            title,
            icon,
            created_time,
            updated_time,
            info,
            template_id,
        }: SqlConversationV2,
    ) -> Self {
        Self {
            id,
            folder_id,
            path,
            title,
            icon,
            created_time,
            updated_time,
            info,
            template_id,
        }
    }
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
    pub fn find_by_path_pre(path: &str, conn: &mut SqliteConnection) -> ChatGPTResult<Vec<Self>> {
        let path = format!("{}/%", path);
        conversations::table
            .filter(conversations::path.like(path))
            .load::<Self>(conn)
            .map_err(|e| e.into())
    }
    pub fn migration_save(
        conversations: Vec<Self>,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<()> {
        diesel::insert_into(conversations::table)
            .values(conversations)
            .execute(conn)?;
        Ok(())
    }
    /// check conversation exists by template_id
    pub fn exists_by_template_id(
        template_id: i32,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<bool> {
        let count = diesel::select(diesel::dsl::exists(
            conversations::table.filter(conversations::template_id.eq(template_id)),
        ))
        .get_result(conn)?;
        Ok(count)
    }
}

#[derive(AsChangeset, Identifiable, Debug)]
#[diesel(table_name = conversations)]
pub struct SqlUpdateConversation {
    pub(in super::super) id: i32,
    pub(in super::super) folder_id: Option<i32>,
    pub(in super::super) path: String,
    pub(in super::super) title: String,
    pub(in super::super) icon: String,
    pub(in super::super) updated_time: OffsetDateTime,
    pub(in super::super) info: Option<String>,
    pub(in super::super) template_id: i32,
}

impl SqlUpdateConversation {
    pub fn update(self, conn: &mut SqliteConnection) -> ChatGPTResult<()> {
        diesel::update(conversations::table)
            .filter(conversations::id.eq(self.id))
            .set(self)
            .execute(conn)?;
        Ok(())
    }
    pub fn from_new_path(
        SqlConversation {
            id,
            folder_id,
            title,
            icon,
            mut path,
            info,
            template_id,
            ..
        }: SqlConversation,
        old_path_pre: &str,
        new_path_pre: &str,
        time: OffsetDateTime,
    ) -> Self {
        path.replace_range(0..old_path_pre.len(), new_path_pre);
        Self {
            id,
            folder_id,
            path,
            title,
            icon,
            updated_time: time,
            info,
            template_id,
        }
    }
    pub fn move_folder(
        id: i32,
        folder: Option<i32>,
        path: &str,
        time: OffsetDateTime,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<()> {
        diesel::update(conversations::table)
            .filter(conversations::id.eq(id))
            .set((
                conversations::path.eq(path),
                conversations::updated_time.eq(time),
                conversations::folder_id.eq(folder),
            ))
            .execute(conn)?;
        Ok(())
    }
}
