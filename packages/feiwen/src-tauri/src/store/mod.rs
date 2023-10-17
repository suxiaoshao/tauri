use crate::errors::{FeiwenError, FeiwenResult};
use diesel::{
    connection::SimpleConnection,
    r2d2::{ConnectionManager, Pool},
    SqliteConnection,
};

pub mod model;
pub mod schema;
pub mod service;
pub mod types;
pub type DbConn = Pool<ConnectionManager<SqliteConnection>>;

pub fn establish_connection(url: &str) -> FeiwenResult<DbConn> {
    let not_exists = check_data_file(url)?;
    let manager = ConnectionManager::<SqliteConnection>::new(url);
    let pool = Pool::builder().test_on_check_out(true).build(manager)?;
    if not_exists {
        create_tables(&pool)?;
    }
    Ok(pool)
}

fn check_data_file(url: &str) -> FeiwenResult<bool> {
    use std::{fs::File, path::Path};
    let path = Path::new(url);
    if !path.exists() {
        std::fs::create_dir_all(path.parent().ok_or(FeiwenError::Path)?)?;
        File::create(path)?;
        return Ok(true);
    }
    Ok(false)
}
fn create_tables(conn: &DbConn) -> FeiwenResult<()> {
    let conn = &mut conn.get()?;
    conn.batch_execute(include_str!(
        "../../migrations/2022-05-15-162950_novel/up.sql"
    ))?;
    conn.batch_execute(include_str!(
        "../../migrations/2022-05-15-163112_tag/up.sql"
    ))?;
    conn.batch_execute(include_str!(
        "../../migrations/2022-05-16-064913_novel_tag/up.sql"
    ))?;
    Ok(())
}
