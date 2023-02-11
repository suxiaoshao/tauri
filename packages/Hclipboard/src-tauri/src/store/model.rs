use crate::error::ClipResult;

use super::schema::history;
use diesel::prelude::*;
use time::OffsetDateTime;

#[derive(Queryable, serde::Serialize)]
pub struct History {
    id: i32,
    data: String,
    #[serde(rename = "updateTime")]
    update_time: i64,
}

#[derive(Insertable)]
#[diesel(table_name = history)]
pub struct NewHistory<'a> {
    data: &'a str,
    update_time: i64,
}

impl History {
    /// 如果没有相同数据插入，有的话更新时间
    pub fn insert(data: &str, conn: &mut SqliteConnection) -> ClipResult<()> {
        match history::table
            .filter(history::data.eq(data))
            .first::<History>(conn)
        {
            Ok(old_history) => old_history.update_data(data, conn)?,
            Err(diesel::NotFound) => {
                Self::create(data, conn)?;
            }
            Err(e) => {
                return Err(e.into());
            }
        };
        Ok(())
    }
    /// 更新数据
    fn update_data(&self, data: &str, conn: &mut SqliteConnection) -> ClipResult<()> {
        let time = OffsetDateTime::now_utc().unix_timestamp();
        diesel::update(history::table.find(self.id))
            .set((history::update_time.eq(time), history::data.eq(data)))
            .execute(conn)?;
        Ok(())
    }
    /// 插入数据
    fn create(data: &str, conn: &mut SqliteConnection) -> QueryResult<()> {
        let time = OffsetDateTime::now_utc().unix_timestamp();
        diesel::insert_into(history::table)
            .values(NewHistory {
                data,
                update_time: time,
            })
            .execute(conn)?;
        Ok(())
    }
    /// 根据数据获取历史记录
    pub fn query(
        search_name: Option<&String>,
        conn: &mut SqliteConnection,
    ) -> ClipResult<Vec<History>> {
        match search_name {
            None => Self::query_all(conn),
            Some(search_name) => Self::query_by_search(search_name, conn),
        }
    }
    /// 根据搜索内容获取历史记录
    fn query_by_search(search_name: &str, conn: &mut SqliteConnection) -> ClipResult<Vec<History>> {
        let data = history::table
            .filter(history::data.like(format!("%{}%", search_name)))
            .order(history::update_time.desc())
            .load::<History>(conn)?;
        Ok(data)
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
    use super::*;
    use crate::store::establish_connection;

    #[test]
    fn insert() -> anyhow::Result<()> {
        let conn = establish_connection(
            "/Users/weijie.su/Library/Application Support/Hclipboard/clipboard.sqlite3",
        )?;
        let conn = &mut conn.get()?;
        History::insert("test", conn)?;
        Ok(())
    }
}
