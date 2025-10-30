use super::schema::history;
use crate::error::{ClipError, ClipResult};
use diesel::prelude::*;
use std::{
    fmt::{Display, Formatter},
    str::FromStr,
};

#[derive(Clone, Copy, serde::Serialize, serde::Deserialize, Debug)]
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

impl FromStr for ClipboardType {
    type Err = ClipError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "text" => Ok(ClipboardType::Text),
            "image" => Ok(ClipboardType::Image),
            "files" => Ok(ClipboardType::Files),
            "rtf" => Ok(ClipboardType::Rtf),
            "html" => Ok(ClipboardType::Html),
            _ => Err(ClipError::InvalidClipboardType(s.to_string())),
        }
    }
}

#[derive(Queryable, serde::Serialize)]
pub struct HistoryModel {
    pub(super) id: i32,
    #[serde(with = "serde_bytes")]
    pub(super) data: Vec<u8>,
    #[serde(rename = "type")]
    pub(super) type_: String,
    #[serde(rename = "updateTime")]
    pub(super) update_time: i64,
}

#[derive(Insertable)]
#[diesel(table_name = history)]
pub struct NewHistory<'a> {
    data: &'a [u8],
    type_: String,
    update_time: i64,
}

impl HistoryModel {
    pub fn find_by_data(data: &[u8], conn: &mut SqliteConnection) -> ClipResult<Option<Self>> {
        let history = history::table
            .filter(history::data.eq(data))
            .first::<HistoryModel>(conn);
        match history {
            Ok(history) => Ok(Some(history)),
            Err(diesel::NotFound) => Ok(None),
            Err(e) => Err(e.into()),
        }
    }
    pub fn find_by_id(id: i32, conn: &mut SqliteConnection) -> ClipResult<Self> {
        let data = history::table
            .filter(history::id.eq(id))
            .first::<HistoryModel>(conn)?;
        Ok(data)
    }
    /// 更新数据时间
    pub(super) fn update_time_by_data(
        data: &[u8],
        time: i64,
        conn: &mut SqliteConnection,
    ) -> ClipResult<()> {
        diesel::update(history::table.filter(history::data.eq(data)))
            .set(history::update_time.eq(time))
            .execute(conn)?;
        Ok(())
    }
    /// 插入数据
    pub(super) fn create(
        data: &[u8],
        r#type: ClipboardType,
        time: i64,
        conn: &mut SqliteConnection,
    ) -> ClipResult<()> {
        diesel::insert_into(history::table)
            .values(NewHistory {
                data,
                update_time: time,
                type_: r#type.to_string(),
            })
            .execute(conn)?;
        Ok(())
    }
    /// 获取所有历史记录
    pub(super) fn query_all(conn: &mut SqliteConnection) -> ClipResult<Vec<HistoryModel>> {
        let data = history::table
            .order(history::update_time.desc())
            .load::<HistoryModel>(conn)?;
        Ok(data)
    }
    /// 根据 type 获取历史记录
    pub(super) fn query_by_type(
        r#type: ClipboardType,
        conn: &mut SqliteConnection,
    ) -> ClipResult<Vec<HistoryModel>> {
        let data = history::table
            .filter(history::type_.eq(r#type.to_string()))
            .order(history::update_time.desc())
            .load::<HistoryModel>(conn)?;
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
        HistoryModel::create(
            b"test",
            ClipboardType::Text,
            time::OffsetDateTime::now_utc().unix_timestamp(),
            conn,
        )?;
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
