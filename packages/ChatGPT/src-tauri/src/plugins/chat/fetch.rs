use crate::{
    errors::{ChatGPTError, ChatGPTResult},
    fetch::{ChatRequest, ChatResponse, FetchRunner},
    store::{Conversation, ConversationTemplate, DbConn, NewMessage, Role, Status},
};
use crate::{plugins::ChatGPTConfig, store::Message};
use tauri::{AppHandle, Manager, Runtime, Window};

#[tauri::command(async)]
pub async fn fetch<R: Runtime>(
    app_handle: AppHandle<R>,
    state: tauri::State<'_, DbConn>,
    id: i32,
    content: String,
) -> ChatGPTResult<()> {
    match _fetch(app_handle, state, id, content).await {
        Ok(x) => {
            log::info!("fetch success: {}", x);
            Ok(())
        }
        Err(err) => {
            log::error!("fetch error: {:?}", err);
            Err(err)
        }
    }
}

struct Fetch<R: Runtime> {
    message_id: i32,
    db_conn: DbConn,
    window: Window<R>,
    config: ChatGPTConfig,
    content: String,
    template: ConversationTemplate,
    messages: Vec<Message>,
}

impl<R> FetchRunner for Fetch<R>
where
    R: Runtime,
{
    fn get_body(&self) -> ChatGPTResult<ChatRequest<'_>> {
        // get request
        let chat_request = ChatRequest::new(
            self.messages.as_slice(),
            &self.template,
            self.content.as_str(),
        );
        Ok(chat_request)
    }

    fn get_api_key(&self) -> ChatGPTResult<&str> {
        self.config.get_api_key()
    }
    fn get_http_proxy(&self) -> ChatGPTResult<&Option<String>> {
        Ok(&self.config.http_proxy)
    }

    fn on_open(&mut self) -> ChatGPTResult<()> {
        log::info!("Connection Opened!");
        Ok(())
    }
    fn url(&self) -> &str {
        self.config.url.as_str()
    }

    fn on_message(&mut self, message: ChatResponse) -> ChatGPTResult<()> {
        let conn = &mut self.db_conn.get()?;
        let content = message
            .choices
            .into_iter()
            .filter_map(|choice| choice.delta.content)
            .collect::<String>();
        Message::add_content(self.message_id, content, conn)?;
        let message = Message::find(self.message_id, conn)?;
        self.window.emit("message", message)?;
        Ok(())
    }

    fn on_error(&mut self, err: reqwest_eventsource::Error) -> ChatGPTResult<()> {
        log::error!("Connection Error: {:?}", err);
        let conn = &mut self.db_conn.get()?;
        Message::update_status(self.message_id, Status::Error, conn)?;
        let message = Message::find(self.message_id, conn)?;
        self.window.emit("message", message)?;
        Ok(())
    }

    fn on_close(&mut self) -> ChatGPTResult<()> {
        log::info!("Connection Closed!");
        let conn = &mut self.db_conn.get()?;
        Message::update_status(self.message_id, Status::Normal, conn)?;
        let message = Message::find(self.message_id, conn)?;
        self.window.emit("message", message)?;
        Ok(())
    }
}

async fn _fetch<R: Runtime>(
    app_handle: AppHandle<R>,
    state: tauri::State<'_, DbConn>,
    id: i32,
    content: String,
) -> ChatGPTResult<i32> {
    let window = app_handle
        .get_window("main")
        .ok_or(ChatGPTError::WindowNotFound)?;
    // get api key
    let config = ChatGPTConfig::get(&app_handle)?;

    // get conn
    let conn = &mut state.get()?;

    // get conversation
    let conversation = Conversation::find(id, conn)?;

    // get conversation template
    let template = crate::store::ConversationTemplate::find(conversation.template_id, conn)?;

    // insert user message
    let user_new_message = NewMessage::new(id, Role::User, content.clone(), Status::Normal);
    let user_message = Message::insert(user_new_message, conn)?;
    window.emit("message", user_message)?;

    // init bot message
    let bot_new_message = NewMessage::new(id, Role::Assistant, "".to_string(), Status::Loading);
    let message = Message::insert(bot_new_message, conn)?;
    let message_id = message.id;
    window.emit("message", message)?;

    let state = state.inner().clone();

    let mut fetch = Fetch {
        message_id,
        db_conn: state,
        window,
        config,
        content,
        messages: conversation.messages,
        template,
    };
    fetch.fetch().await?;

    Ok(message_id)
}
