/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-24 19:32:52
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-28 06:33:42
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/store/migrations/v1/mod.rs
 */
use crate::errors::ChatGPTResult;
use diesel::SqliteConnection;

mod conversations;
mod folders;
mod messages;
mod schema;

pub use conversations::SqlConversationV1;
pub use folders::SqlFolderV1;
pub use messages::SqlMessageV1;

pub struct AllData {
    pub conversations: Vec<conversations::SqlConversationV1>,
    pub folders: Vec<folders::SqlFolderV1>,
    pub messages: Vec<messages::SqlMessageV1>,
}

pub fn get_all_data(conn: &mut SqliteConnection) -> ChatGPTResult<AllData> {
    let all_conversations = conversations::SqlConversationV1::all(conn)?;
    let all_folders = folders::SqlFolderV1::all(conn)?;
    let all_messages = messages::SqlMessageV1::all(conn)?;
    Ok(AllData {
        conversations: all_conversations,
        folders: all_folders,
        messages: all_messages,
    })
}
