/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-28 08:02:09
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/store/mod.rs
 */
mod migrations;
mod model;
mod schema;
mod service;
mod types;

use std::path::Path;

use crate::errors::{ChatGPTError, ChatGPTResult};
use diesel::{
    Connection, SqliteConnection,
    connection::SimpleConnection,
    r2d2::{ConnectionManager, Pool},
};

pub use service::{
    Conversation, ConversationTemplate, Folder, Message, NewConversation, NewConversationTemplate,
    NewFolder, NewMessage, deserialize_offset_date_time, serialize_offset_date_time,
};
use time::OffsetDateTime;
pub use types::{Mode, Role, Status};

use self::model::{SqlConversationTemplate, SqlNewConversation, SqlNewConversationTemplate};

const DB_FILE: &str = "history.sqlite3";
const DB_FILE_V2: &str = "history_v2.sqlite3";
const DB_FILE_V3: &str = "history_v3.sqlite3";
const CREATE_TABLE_SQL: &str =
    include_str!("../../migrations/2023-07-25-025504_create_table/up.sql");

pub enum StoreVersion {
    None(DbConn),
    V1 {
        conn: DbConn,
        v1_db: SqliteConnection,
    },
    V2 {
        conn: DbConn,
        v2_db: SqliteConnection,
    },
    V3(DbConn),
}

impl StoreVersion {
    pub fn migration(self) -> ChatGPTResult<DbConn> {
        match self {
            StoreVersion::None(conn) => {
                log::info!("Migrating from None to V2");
                let c = &mut conn.get()?;
                init_tables(c)?;
                Ok(conn)
            }
            StoreVersion::V1 { conn, mut v1_db } => {
                log::info!("Migrating from V1 to V2");
                let v2_db = &mut conn.get()?;
                if migrations::v1_to_v2(&mut v1_db, v2_db).is_err() {
                    init_tables(v2_db)?;
                };
                Ok(conn)
            }
            StoreVersion::V2 { conn, v2_db } => todo!(),
            StoreVersion::V3(pool) => Ok(pool),
        }
    }
    pub fn new(config_dir: &Path) -> ChatGPTResult<Self> {
        let v1_filepath = config_dir.join(DB_FILE);
        let v2_filepath = config_dir.join(DB_FILE_V2);
        let v3_filepath = config_dir.join(DB_FILE_V3);
        match (
            v1_filepath.exists(),
            v2_filepath.exists(),
            v3_filepath.exists(),
        ) {
            (true, false, false) => Ok(StoreVersion::V1 {
                conn: get_dbconn(&v3_filepath)?,
                v1_db: SqliteConnection::establish(
                    v1_filepath.to_str().ok_or(ChatGPTError::DbPath)?,
                )?,
            }),
            (_, true, false) => Ok(StoreVersion::V2 {
                conn: get_dbconn(&v3_filepath)?,
                v2_db: SqliteConnection::establish(
                    v2_filepath.to_str().ok_or(ChatGPTError::DbPath)?,
                )?,
            }),
            (_, _, true) => Ok(StoreVersion::V3(get_dbconn(&v3_filepath)?)),
            _ => Ok(StoreVersion::None(get_dbconn(&v3_filepath)?)),
        }
    }
}

pub type DbConn = Pool<ConnectionManager<SqliteConnection>>;

pub fn establish_connection(config_dir: &Path) -> ChatGPTResult<DbConn> {
    create_config_dir(config_dir)?;
    let store_version = StoreVersion::new(config_dir)?;
    store_version.migration()
}

fn create_config_dir(config_dir: &Path) -> ChatGPTResult<()> {
    if !config_dir.exists() {
        std::fs::create_dir_all(config_dir)?;
    }
    Ok(())
}

fn get_dbconn(db_path: &Path) -> ChatGPTResult<DbConn> {
    let manager =
        ConnectionManager::<SqliteConnection>::new(db_path.to_str().ok_or(ChatGPTError::DbPath)?);
    let pool = Pool::builder().test_on_check_out(true).build(manager)?;
    Ok(pool)
}

pub fn init_tables(conn: &mut SqliteConnection) -> ChatGPTResult<()> {
    conn.immediate_transaction(|conn| {
        // Create tables
        conn.batch_execute(CREATE_TABLE_SQL)?;
        // Insert conversation template
        let default_conversation_template = SqlNewConversationTemplate::default();
        default_conversation_template.insert(conn)?;
        // Insert default conversation
        let SqlConversationTemplate { id, .. } = SqlConversationTemplate::first(conn)?;
        let now = OffsetDateTime::now_utc();
        let default_conversation = SqlNewConversation {
            title: "默认".to_string(),
            path: "/默认".to_string(),
            folder_id: None,
            icon: "🤖".to_string(),
            info: None,
            template_id: id,
            created_time: now,
            updated_time: now,
        };
        default_conversation.insert(conn)?;
        Ok(())
    })
}
