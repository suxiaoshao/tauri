use serde_json::Value;
use tauri::{AppHandle, Invoke, Manager, Runtime};

use crate::store::{Conversation, DbConn};
use crate::{errors::ChatGPTError, store::NewConversation};
use crate::{
    errors::ChatGPTResult,
    fetch::{fetch as http_fetch, ChatRequest},
    store,
};

use super::config::ChatGPTConfig;

pub struct ChatPlugin;

impl<R: Runtime> tauri::plugin::Plugin<R> for ChatPlugin {
    fn name(&self) -> &'static str {
        "chat"
    }
    fn initialize(&mut self, app: &AppHandle<R>, _: Value) -> tauri::plugin::Result<()> {
        setup(app)?;
        Ok(())
    }
    fn extend_api(&mut self, invoke: Invoke<R>) {
        let handle: Box<dyn Fn(Invoke<R>) + Send + Sync> = Box::new(tauri::generate_handler![
            fetch,
            get_conversations,
            save_conversation,
            add_message,
        ]);
        (handle)(invoke);
    }
}
// remember to call `.manage(MyState::default())`
#[tauri::command(async)]
async fn fetch<R: Runtime>(app_handle: AppHandle<R>, body: ChatRequest) -> ChatGPTResult<()> {
    let config = ChatGPTConfig::get(&app_handle)?;
    let api_key = config.get_api_key()?;
    http_fetch(api_key, &body, |x| {
        app_handle.emit_to("main", "fetch", &x).unwrap();
    })
    .await?;
    Ok(())
}
#[tauri::command]
async fn get_conversations(state: tauri::State<'_, DbConn>) -> ChatGPTResult<Vec<Conversation>> {
    let mut conn = state.get()?;
    let data = Conversation::query_all(&mut conn)?;
    Ok(data)
}

#[tauri::command]
async fn save_conversation(
    state: tauri::State<'_, DbConn>,
    data: NewConversation,
) -> ChatGPTResult<()> {
    let mut conn = state.get()?;
    Conversation::insert(data, &mut conn)?;
    Ok(())
}

#[tauri::command]
async fn add_message(
    state: tauri::State<'_, DbConn>,
    data: store::NewMessage,
) -> ChatGPTResult<()> {
    let mut conn = state.get()?;
    store::Message::insert(data, &mut conn)?;
    Ok(())
}

fn setup<R: Runtime>(app: &AppHandle<R>) -> ChatGPTResult<()> {
    use tauri::api::path::*;
    //data path
    let data_path = app_config_dir(&app.config())
        .ok_or(ChatGPTError::DbPath)?
        .join("history.sqlite3")
        .to_str()
        .ok_or(ChatGPTError::DbPath)?
        .to_string();
    // database connection
    let conn = store::establish_connection(&data_path)?;
    app.manage(conn);
    Ok(())
}
