/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-28 04:36:24
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/store/mod.rs
 */
mod migrations;
mod model;
mod schema;
mod service;
mod types;

use std::path::{Path, PathBuf};

use crate::errors::{ChatGPTError, ChatGPTResult};
use diesel::{
    connection::SimpleConnection,
    r2d2::{ConnectionManager, Pool},
    SqliteConnection,
};

pub use service::conversations::*;
pub use service::folders::*;
pub use service::messages::*;
use time::OffsetDateTime;
pub use types::*;

use self::model::{
    conversation_templates::{SqlConversationTemplate, SqlNewConversationTemplate},
    conversations::SqlNewConversation,
};

const DB_FILE: &str = "history.sqlite3";
const DB_FILE_V2: &str = "history_v2.sqlite3";

pub enum StoreVersion {
    None,
    V1,
    V2,
}

impl StoreVersion {
    pub fn migration(&self, conn: &DbConn) -> ChatGPTResult<()> {
        let mut conn = conn.get()?;
        match self {
            StoreVersion::None => {
                create_tables(&mut conn)?;
            }
            StoreVersion::V1 => {
                todo!("V1 to V2 migration")
            }
            StoreVersion::V2 => {}
        }
        Ok(())
    }
}

pub type DbConn = Pool<ConnectionManager<SqliteConnection>>;

pub fn establish_connection(config_dir: &Path) -> ChatGPTResult<DbConn> {
    create_config_dir(config_dir)?;
    let (version, db_path) = check_store_version(config_dir)?;
    let manager =
        ConnectionManager::<SqliteConnection>::new(db_path.to_str().ok_or(ChatGPTError::DbPath)?);
    let pool = Pool::builder().test_on_check_out(true).build(manager)?;
    version.migration(&pool)?;
    Ok(pool)
}

fn create_config_dir(config_dir: &Path) -> ChatGPTResult<()> {
    if !config_dir.exists() {
        std::fs::create_dir_all(config_dir)?;
    }
    Ok(())
}

fn check_store_version(config_dir: &Path) -> ChatGPTResult<(StoreVersion, PathBuf)> {
    let v1_filepath = config_dir.join(DB_FILE);
    let v2_filepath = config_dir.join(DB_FILE_V2);
    match (v1_filepath.exists(), v2_filepath.exists()) {
        (true, false) => Ok((StoreVersion::V1, v2_filepath)),
        (_, true) => Ok((StoreVersion::V2, v2_filepath)),
        _ => Ok((StoreVersion::None, v2_filepath)),
    }
}

pub fn create_tables(conn: &mut SqliteConnection) -> ChatGPTResult<()> {
    conn.immediate_transaction(|conn| {
        // Create tables
        conn.batch_execute(include_str!(
            "../../migrations/2023-07-25-025504_create_table/up.sql"
        ))?;
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
