use diesel::{
    connection::SimpleConnection,
    r2d2::{ConnectionManager, Pool},
    SqliteConnection,
};

pub mod model;
mod schema;

pub type DbConn = Pool<ConnectionManager<SqliteConnection>>;

pub fn establish_connection(url: &str) -> ClipResult<DbConn> {
    let not_exists = check_data_file(url)?;
    let manager = ConnectionManager::<SqliteConnection>::new(url);
    let pool = Pool::builder().test_on_check_out(true).build(manager)?;
    if not_exists {
        create_tables(&pool)?;
    }
    Ok(pool)
}

fn check_data_file(url: &str) -> ClipResult<bool> {
    use std::{fs::File, path::Path};
    let path = Path::new(url);
    if !path.exists() {
        std::fs::create_dir_all(path.parent().ok_or(ClipError::Path)?)?;
        File::create(path)?;
        return Ok(true);
    }
    Ok(false)
}
fn create_tables(conn: &DbConn) -> ClipResult<()> {
    conn.get()?
        .batch_execute(include_str!(
            "../../migrations/2022-09-27-115421_table/up.sql"
        ))
        .map_err(|e| e.into())
}

pub use model::History;

use crate::error::{ClipError, ClipResult};
