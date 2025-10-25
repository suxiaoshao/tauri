use std::fmt::{Display, Formatter};

use crate::error::ClipResult;

use super::schema::history;
use diesel::prelude::*;
use time::OffsetDateTime;

#[derive(Clone, Copy)]
pub enum ClipboardType {
    Text,
    Image,
    Files,
    Rtf,
    Html,
}

impl Display for ClipboardType {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            ClipboardType::Text => f.write_str("text"),
            ClipboardType::Image => f.write_str("image"),
            ClipboardType::Files => f.write_str("files"),
            ClipboardType::Rtf => f.write_str("rtf"),
            ClipboardType::Html => f.write_str("html"),
        }
    }
}

#[derive(Queryable, serde::Serialize)]
pub struct History {
    id: i32,
    #[serde(with = "serde_bytes")]
    data: Vec<u8>,
    #[serde(rename = "type")]
    type_: String,
    #[serde(rename = "updateTime")]
    update_time: i64,
}

#[derive(Insertable)]
#[diesel(table_name = history)]
pub struct NewHistory<'a> {
    data: &'a [u8],
    type_: String,
    update_time: i64,
}

impl History {
    /// 如果没有相同数据插入，有的话更新时间
    pub fn insert(
        data: &[u8],
        r#type: ClipboardType,
        conn: &mut SqliteConnection,
    ) -> ClipResult<()> {
        match history::table
            .filter(history::data.eq(data))
            .first::<History>(conn)
        {
            Ok(old_history) => old_history.update_data(data, conn)?,
            Err(diesel::NotFound) => {
                Self::create(data, r#type, conn)?;
            }
            Err(e) => {
                return Err(e.into());
            }
        };
        Ok(())
    }
    /// 更新数据
    fn update_data(&self, data: &[u8], conn: &mut SqliteConnection) -> ClipResult<()> {
        let time = OffsetDateTime::now_utc().unix_timestamp();
        diesel::update(history::table.find(self.id))
            .set((history::update_time.eq(time), history::data.eq(data)))
            .execute(conn)?;
        Ok(())
    }
    /// 插入数据
    fn create(data: &[u8], r#type: ClipboardType, conn: &mut SqliteConnection) -> ClipResult<()> {
        let time = OffsetDateTime::now_utc().unix_timestamp();
        diesel::insert_into(history::table)
            .values(NewHistory {
                data,
                update_time: time,
                type_: r#type.to_string(),
            })
            .execute(conn)?;
        Ok(())
    }
    /// 根据数据获取历史记录
    pub fn query(
        search_content: Option<&[u8]>,
        conn: &mut SqliteConnection,
    ) -> ClipResult<Vec<History>> {
        let data = Self::query_all(conn)?;
        match search_content {
            None => Ok(data),
            Some(search_name) => Ok(data
                .into_iter()
                .filter(|History { data, .. }| {
                    data.windows(search_name.len())
                        .any(|window| window == search_name)
                })
                .collect::<Vec<_>>()),
        }
    }
    /// 获取所有历史记录
    fn query_all(conn: &mut SqliteConnection) -> ClipResult<Vec<History>> {
        let data = history::table
            .order(history::update_time.desc())
            .load::<History>(conn)?;
        Ok(data)
    }
}

#[cfg(test)]
mod tests {
    use diesel::{
        connection::SimpleConnection,
        r2d2::{ConnectionManager, Pool},
    };

    use crate::store::DbConn;

    use super::*;

    #[test]
    fn insert() -> anyhow::Result<()> {
        let conn = establish_connection()?;
        let conn = &mut conn.get()?;
        History::insert(b"test", ClipboardType::Text, conn)?;
        Ok(())
    }
    pub fn establish_connection() -> ClipResult<DbConn> {
        let manager = ConnectionManager::<SqliteConnection>::new("file::memory:");
        let pool = Pool::builder().test_on_check_out(true).build(manager)?;
        create_tables(&pool)?;
        Ok(pool)
    }

    fn create_tables(conn: &DbConn) -> ClipResult<()> {
        conn.get()?
            .batch_execute(include_str!(
                "../../migrations/2022-09-27-115421_table/up.sql"
            ))
            .map_err(|e| e.into())
    }
}
