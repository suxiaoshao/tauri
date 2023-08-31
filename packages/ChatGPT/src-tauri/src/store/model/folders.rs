use crate::errors::ChatGPTResult;

use super::super::schema::folders;
use diesel::prelude::*;
use time::OffsetDateTime;

#[derive(Queryable, Debug)]
pub struct SqlFolder {
    pub(in super::super) id: i32,
    pub(in super::super) name: String,
    pub(in super::super) path: String,
    pub(in super::super) parent_id: Option<i32>,
    pub(in super::super) created_time: OffsetDateTime,
    pub(in super::super) updated_time: OffsetDateTime,
}

impl SqlFolder {
    pub fn query(conn: &mut SqliteConnection) -> ChatGPTResult<Vec<Self>> {
        let sql_folders = folders::table
            .filter(folders::parent_id.is_null())
            .order(folders::updated_time.desc())
            .load::<SqlFolder>(conn)?;
        Ok(sql_folders)
    }
    pub fn query_by_parent_id(
        parent_id: i32,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<Vec<Self>> {
        let sql_folders = folders::table
            .filter(folders::parent_id.eq(parent_id))
            .order(folders::updated_time.desc())
            .load::<SqlFolder>(conn)?;
        Ok(sql_folders)
    }
    pub fn find(id: i32, conn: &mut SqliteConnection) -> ChatGPTResult<Self> {
        let sql_folder = folders::table.find(id).first::<SqlFolder>(conn)?;
        Ok(sql_folder)
    }
    pub fn path_exists(path: &str, conn: &mut SqliteConnection) -> ChatGPTResult<bool> {
        let count = folders::table
            .filter(folders::path.eq(path))
            .count()
            .get_result::<i64>(conn)?;
        Ok(count > 0)
    }
    pub fn delete_by_id(id: i32, conn: &mut SqliteConnection) -> ChatGPTResult<()> {
        diesel::delete(folders::table.find(id)).execute(conn)?;
        Ok(())
    }
    pub fn delete_by_path(path: &str, conn: &mut SqliteConnection) -> ChatGPTResult<()> {
        let path = format!("{}/%", path);
        diesel::delete(folders::table.filter(folders::path.like(path))).execute(conn)?;
        Ok(())
    }
}

#[derive(Insertable)]
#[diesel(table_name = folders)]
pub struct SqlNewFolder {
    pub(in super::super) name: String,
    pub(in super::super) path: String,
    pub(in super::super) parent_id: Option<i32>,
    pub(in super::super) created_time: OffsetDateTime,
    pub(in super::super) updated_time: OffsetDateTime,
}

impl SqlNewFolder {
    pub fn insert(&self, conn: &mut SqliteConnection) -> ChatGPTResult<()> {
        diesel::insert_into(folders::table)
            .values(self)
            .execute(conn)?;
        Ok(())
    }
}

#[derive(AsChangeset, Identifiable)]
#[diesel(table_name = folders)]
pub struct SqlUpdateFolder {
    pub(in super::super) id: i32,
    pub(in super::super) name: String,
    pub(in super::super) path: String,
    pub(in super::super) parent_id: Option<i32>,
    pub(in super::super) updated_time: OffsetDateTime,
}

impl SqlUpdateFolder {
    pub fn update(&self, conn: &mut SqliteConnection) -> ChatGPTResult<()> {
        diesel::update(folders::table)
            .filter(folders::id.eq(self.id))
            .set(self)
            .execute(conn)?;
        Ok(())
    }
}
