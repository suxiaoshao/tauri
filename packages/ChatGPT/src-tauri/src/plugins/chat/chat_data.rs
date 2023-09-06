use crate::{
    errors::ChatGPTResult,
    store::{Conversation, DbConn, Folder},
};

#[derive(serde::Serialize)]
pub struct ChatData {
    conversations: Vec<Conversation>,
    folders: Vec<Folder>,
}

#[tauri::command]
pub async fn get_chat_data(state: tauri::State<'_, DbConn>) -> ChatGPTResult<ChatData> {
    let conn = &mut state.get()?;
    let conversations = Conversation::query_without_folder(conn)?;
    let folders = Folder::query(conn)?;
    Ok(ChatData {
        conversations,
        folders,
    })
}
