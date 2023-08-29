mod model;
mod schema;
mod service;
mod types;

use crate::errors::{ChatGPTError, ChatGPTResult};
use diesel::{
    connection::SimpleConnection,
    r2d2::{ConnectionManager, Pool},
    SqliteConnection,
};

pub use service::conversations::*;
pub use service::folders::*;
pub use service::messages::*;
pub use types::*;

pub type DbConn = Pool<ConnectionManager<SqliteConnection>>;

pub fn establish_connection(url: &str) -> ChatGPTResult<DbConn> {
    let not_exists = check_data_file(url)?;
    let manager = ConnectionManager::<SqliteConnection>::new(url);
    let pool = Pool::builder().test_on_check_out(true).build(manager)?;
    if not_exists {
        create_tables(&pool)?;
    }
    Ok(pool)
}

fn check_data_file(url: &str) -> ChatGPTResult<bool> {
    use std::{fs::File, path::Path};
    let path = Path::new(url);
    if !path.exists() {
        std::fs::create_dir_all(path.parent().ok_or(ChatGPTError::Path)?)?;
        File::create(path)?;
        return Ok(true);
    }
    Ok(false)
}
fn create_tables(conn: &DbConn) -> ChatGPTResult<()> {
    conn.get()?
        .batch_execute(include_str!(
            "../../migrations/2023-07-25-025504_create_table/up.sql"
        ))
        .map_err(|e| e.into())
}
