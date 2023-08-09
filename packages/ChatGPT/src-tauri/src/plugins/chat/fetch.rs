use crate::{
    errors::ChatGPTResult,
    fetch::{fetch as http_fetch, ChatRequest, ChatResponse},
    store::{Conversation, DbConn, NewMessage, Role, Status},
};
use crate::{plugins::config::ChatGPTConfig, store::Message};
use diesel::SqliteConnection;
use tauri::{AppHandle, Runtime};

#[tauri::command(async)]
pub async fn fetch<R: Runtime>(
    app_handle: AppHandle<R>,
    state: tauri::State<'_, DbConn>,
    id: i32,
    content: String,
) -> ChatGPTResult<Message> {
    match _fetch(app_handle, state, id, content).await {
        Ok(x) => {
            log::info!("fetch success: {}", x.id);
            Ok(x)
        }
        Err(err) => {
            log::error!("fetch error: {:?}", err);
            Err(err)
        }
    }
}

async fn _fetch<R: Runtime>(
    app_handle: AppHandle<R>,
    state: tauri::State<'_, DbConn>,
    id: i32,
    content: String,
) -> ChatGPTResult<Message> {
    let config = ChatGPTConfig::get(&app_handle)?;
    let api_key = config.get_api_key()?.to_owned();
    let conn = &mut state.get()?;
    let conversation = Conversation::find(id, conn)?;
    let chat_request = ChatRequest::new(conversation, content.clone());
    let user_new_message = NewMessage::new(id, Role::User, content, Status::Normal);
    Message::insert(user_new_message, conn)?;
    let bot_new_message = NewMessage::new(id, Role::Assistant, "".to_string(), Status::Normal);
    let message = Message::insert(bot_new_message, conn)?;
    let state = state.inner().clone();
    tokio::spawn(async move {
        let result = spawn_fetch(&state, api_key, chat_request, message.id).await;
        if let Err(err) = result {
            log::error!("spawn fetch error: {:?}", err);
        }
    });
    Ok(message)
}

async fn spawn_fetch(
    conn: &DbConn,
    api_key: String,
    chat_request: ChatRequest,
    message_id: i32,
) -> ChatGPTResult<()> {
    http_fetch(&api_key, &chat_request, |response| {
        let conn = &mut conn.get().unwrap();
        let result = dispose_response(response, message_id, conn);
        if let Err(err) = result {
            log::error!("dispose response error: {:?}", err);
        }
    })
    .await?;
    Ok(())
}

fn dispose_response(
    response: ChatResponse,
    message_id: i32,
    conn: &mut SqliteConnection,
) -> ChatGPTResult<()> {
    let content = response
        .choices
        .into_iter()
        .filter_map(|choice| choice.delta.content)
        .collect::<String>();
    Message::add_content(message_id, content, conn)?;
    Ok(())
}
