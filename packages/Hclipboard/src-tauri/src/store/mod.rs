use diesel::{
    r2d2::{ConnectionManager, Pool},
    SqliteConnection,
};

pub mod model;
mod schema;

pub type DbConn = Pool<ConnectionManager<SqliteConnection>>;

pub fn establish_connection(url: &str) -> ClipResult<DbConn> {
    let manager = ConnectionManager::<SqliteConnection>::new(url);
    let pool = Pool::builder().test_on_check_out(true).build(manager)?;
    Ok(pool)
}

pub use model::History;

use crate::error::ClipResult;
