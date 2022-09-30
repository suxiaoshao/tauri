use crate::error::ClipResult;

use super::schema::history;
use diesel::prelude::*;
use time::{OffsetDateTime, PrimitiveDateTime};

#[derive(Queryable)]
pub struct History {
    id: i32,
    data: String,
    update_time: PrimitiveDateTime,
}

#[derive(Insertable)]
#[diesel(table_name = history)]
pub struct NewHistory<'a> {
    data: &'a str,
    update_time: PrimitiveDateTime,
}

impl History {
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
    fn update_data(&self, data: &str, conn: &mut SqliteConnection) -> ClipResult<()> {
        let time = OffsetDateTime::now_utc();
        let time = PrimitiveDateTime::new(time.date(), time.time());
        diesel::update(history::table.find(self.id))
            .set((history::update_time.eq(time), history::data.eq(data)))
            .execute(conn)?;
        Ok(())
    }
    fn create(data: &str, conn: &mut SqliteConnection) -> QueryResult<()> {
        let time = OffsetDateTime::now_utc();
        let time = PrimitiveDateTime::new(time.date(), time.time());
        diesel::insert_into(history::table)
            .values(NewHistory {
                data,
                update_time: time,
            })
            .execute(conn)?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::store::establish_connection;

    #[test]
    fn insert() -> anyhow::Result<()> {
        let mut conn = establish_connection(
            "file:/Users/weijie.su/Library/Application Support/Hclipboard/clipboard.sqlite3",
        )?;
        let conn = &mut conn.get()?;
        History::insert("test", conn)?;
        Ok(())
    }
}