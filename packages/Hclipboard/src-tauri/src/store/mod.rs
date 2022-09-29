use diesel::{Connection, SqliteConnection};

mod model;
mod schema;

pub fn establish_connection(url: String) -> SqliteConnection {
    SqliteConnection::establish(&url).unwrap_or_else(|_| panic!("Error connecting to {}", url))
}
