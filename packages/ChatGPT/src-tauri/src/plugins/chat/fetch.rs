use crate::{
    errors::ChatGPTResult,
    fetch::{fetch as http_fetch, ChatRequest},
    store::{Conversation, DbConn, NewMessage, Role, Status},
};
use crate::{plugins::config::ChatGPTConfig, store::Message};
use tauri::{AppHandle, Manager, Runtime};

#[tauri::command(async)]
pub async fn fetch<R: Runtime>(
    app_handle: AppHandle<R>,
    state: tauri::State<'_, DbConn>,
    id: i32,
    content: String,
) -> ChatGPTResult<Message> {
    let config = ChatGPTConfig::get(&app_handle)?;
    let api_key = config.get_api_key()?;
    let mut conn = &mut state.get()?;
    let conversation = Conversation::find(id, conn)?;
    let new_message = NewMessage::new(Role::User, content, Status::Normal);
    Message::insert(new_message, conn)?;
    let new_message = NewMessage::new(Role::Assistant, "".to_string(), Status::Normal);
    let message = Message::insert(new_message, conn)?;
    Ok(message)
}
