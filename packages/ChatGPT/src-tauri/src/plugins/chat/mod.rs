mod fetch;

use serde_json::Value;
use tauri::{AppHandle, Invoke, Manager, Runtime};

use crate::store::{Conversation, DbConn, Folder, NewFolder};
use crate::{errors::ChatGPTError, store::NewConversation};
use crate::{errors::ChatGPTResult, store};

pub struct ChatPlugin;
mod chat_data;

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
            fetch::fetch,
            add_conversation,
            update_conversation,
            delete_conversation,
            chat_data::get_chat_data,
            add_folder,
            update_folder,
            delete_folder
        ]);
        (handle)(invoke);
    }
}

#[tauri::command]
async fn add_conversation(
    state: tauri::State<'_, DbConn>,
    data: NewConversation,
) -> ChatGPTResult<()> {
    let mut conn = state.get()?;
    Conversation::insert(data, &mut conn)?;
    Ok(())
}

#[tauri::command]
async fn update_conversation(
    state: tauri::State<'_, DbConn>,
    id: i32,
    data: NewConversation,
) -> ChatGPTResult<()> {
    let conn = &mut state.get()?;
    Conversation::update(id, data, conn)?;
    Ok(())
}

#[tauri::command]
async fn add_folder(state: tauri::State<'_, DbConn>, folder: NewFolder) -> ChatGPTResult<()> {
    let conn = &mut state.get()?;
    Folder::insert(folder, conn)?;
    Ok(())
}

#[tauri::command]
async fn update_folder(
    state: tauri::State<'_, DbConn>,
    id: i32,
    folder: NewFolder,
) -> ChatGPTResult<()> {
    let conn = &mut state.get()?;
    Folder::update(id, folder, conn)?;
    Ok(())
}
#[tauri::command]
async fn delete_conversation(state: tauri::State<'_, DbConn>, id: i32) -> ChatGPTResult<()> {
    let conn = &mut state.get()?;
    Conversation::delete_by_id(id, conn)?;
    Ok(())
}

#[tauri::command]
async fn delete_folder(state: tauri::State<'_, DbConn>, id: i32) -> ChatGPTResult<()> {
    let conn = &mut state.get()?;
    Folder::delete_by_id(id, conn)?;
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
