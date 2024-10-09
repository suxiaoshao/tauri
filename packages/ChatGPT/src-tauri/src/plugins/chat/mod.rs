mod fetch;

use serde_json::Value;
use tauri::{ipc::Invoke, AppHandle, Emitter, Manager, Runtime};

use crate::store::{
    Conversation, ConversationTemplate, DbConn, Folder, Message, NewConversationTemplate, NewFolder,
};
use crate::{errors::ChatGPTError, store::NewConversation};
use crate::{errors::ChatGPTResult, store};

pub struct ChatPlugin;
mod chat_data;
mod export;

impl<R: Runtime> tauri::plugin::Plugin<R> for ChatPlugin {
    fn name(&self) -> &'static str {
        "chat"
    }
    fn initialize(
        &mut self,
        app: &AppHandle<R>,
        _: Value,
    ) -> Result<(), Box<dyn std::error::Error>> {
        setup(app)?;
        Ok(())
    }
    fn extend_api(&mut self, invoke: Invoke<R>) -> bool {
        let handle: Box<dyn Fn(Invoke<R>) -> bool + Send + Sync> =
            Box::new(tauri::generate_handler![
                fetch::fetch,
                add_conversation,
                update_conversation,
                delete_conversation,
                move_conversation,
                chat_data::get_chat_data,
                add_folder,
                update_folder,
                delete_folder,
                move_folder,
                delete_message,
                find_message,
                update_message_content,
                clear_conversation,
                export::export,
                all_conversation_templates,
                find_conversation_template,
                delete_conversation_template,
                update_conversation_template,
                add_conversation_template
            ]);
        (handle)(invoke)
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

#[tauri::command]
async fn move_conversation(
    state: tauri::State<'_, DbConn>,
    conversation_id: i32,
    folder_id: Option<i32>,
) -> ChatGPTResult<()> {
    let conn = &mut state.get()?;
    Conversation::move_folder(conversation_id, folder_id, conn)?;
    Ok(())
}

#[tauri::command]
async fn clear_conversation(state: tauri::State<'_, DbConn>, id: i32) -> ChatGPTResult<()> {
    let conn = &mut state.get()?;
    Conversation::clear(id, conn)?;
    Ok(())
}

#[tauri::command]
async fn move_folder(
    state: tauri::State<'_, DbConn>,
    id: i32,
    parent_id: Option<i32>,
) -> ChatGPTResult<()> {
    let conn = &mut state.get()?;
    Folder::move_folder(id, parent_id, conn)?;
    Ok(())
}
#[tauri::command]
async fn delete_message(state: tauri::State<'_, DbConn>, id: i32) -> ChatGPTResult<()> {
    let conn = &mut state.get()?;
    store::Message::delete(id, conn)?;
    Ok(())
}
#[tauri::command]
async fn find_message(state: tauri::State<'_, DbConn>, id: i32) -> ChatGPTResult<Message> {
    let conn = &mut state.get()?;
    let message = store::Message::find(id, conn)?;
    Ok(message)
}
#[tauri::command]
async fn update_message_content<R: Runtime>(
    app: AppHandle<R>,
    state: tauri::State<'_, DbConn>,
    id: i32,
    content: String,
) -> ChatGPTResult<()> {
    let conn = &mut state.get()?;
    store::Message::update_content(id, content, conn)?;
    let message = store::Message::find(id, conn)?;
    let window = app
        .get_webview_window("main")
        .ok_or(ChatGPTError::WindowNotFound)?;
    window.emit("message", message)?;
    Ok(())
}

#[tauri::command]
async fn all_conversation_templates(
    state: tauri::State<'_, DbConn>,
) -> ChatGPTResult<Vec<ConversationTemplate>> {
    let conn = &mut state.get()?;
    let conversations = ConversationTemplate::all(conn)?;
    Ok(conversations)
}

#[tauri::command]
async fn find_conversation_template(
    state: tauri::State<'_, DbConn>,
    id: i32,
) -> ChatGPTResult<ConversationTemplate> {
    let conn = &mut state.get()?;
    let conversation = ConversationTemplate::find(id, conn)?;
    Ok(conversation)
}

#[tauri::command]
async fn delete_conversation_template(
    state: tauri::State<'_, DbConn>,
    id: i32,
) -> ChatGPTResult<()> {
    let conn = &mut state.get()?;
    ConversationTemplate::delete(id, conn)?;
    Ok(())
}

#[tauri::command]
async fn update_conversation_template(
    state: tauri::State<'_, DbConn>,
    id: i32,
    data: NewConversationTemplate,
) -> ChatGPTResult<()> {
    let conn = &mut state.get()?;
    ConversationTemplate::update(data, id, conn)?;
    Ok(())
}

#[tauri::command]
async fn add_conversation_template(
    state: tauri::State<'_, DbConn>,
    data: NewConversationTemplate,
) -> ChatGPTResult<i32> {
    let conn = &mut state.get()?;
    let id = data.insert(conn)?;
    Ok(id)
}

fn setup<R: Runtime>(app: &AppHandle<R>) -> ChatGPTResult<()> {
    //data path
    let data_path = app
        .path()
        .app_config_dir()
        .map_err(|_| ChatGPTError::DbPath)?;
    // database connection
    let conn = store::establish_connection(&data_path)?;
    app.manage(conn);
    Ok(())
}
