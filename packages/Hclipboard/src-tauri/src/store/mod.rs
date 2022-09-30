use diesel::{Connection, SqliteConnection};

pub mod model;
mod schema;

pub fn establish_connection(url: &str) -> SqliteConnection {
    SqliteConnection::establish(url).unwrap_or_else(|_| panic!("Error connecting to {}", url))
}

pub use model::History;
