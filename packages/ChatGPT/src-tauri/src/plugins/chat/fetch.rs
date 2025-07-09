use crate::{
    errors::{ChatGPTError, ChatGPTResult},
    extensions::ExtensionContainer,
    fetch::FetchRunner,
    store::{Content, Conversation, ConversationTemplate, DbConn, Mode, NewMessage, Role, Status},
};
use crate::{fetch::Message as FetchMessage, plugins::ChatGPTConfig, store::Message};
use futures::{StreamExt, pin_mut};
use tauri::{AppHandle, Emitter, Manager, Runtime, WebviewWindow};

#[tauri::command(async)]
pub async fn fetch<R: Runtime>(
    app_handle: AppHandle<R>,
    state: tauri::State<'_, DbConn>,
    id: i32,
    content: String,
    extension_name: Option<String>,
) -> ChatGPTResult<()> {
    match _fetch(app_handle, state, id, content, extension_name).await {
        Ok(x) => {
            log::info!("fetch success: {x}");
            Ok(())
        }
        Err(err) => {
            log::error!("fetch error: {err:?}");
            Err(err)
        }
    }
}

struct Fetch<R: Runtime> {
    message_id: i32,
    db_conn: DbConn,
    window: WebviewWindow<R>,
    config: ChatGPTConfig,
    template: ConversationTemplate,
    history_messages: Vec<Message>,
    user_message: Message,
}

impl<R: Runtime> Fetch<R> {
    fn on_message(&self, message: String) -> ChatGPTResult<()> {
        let conn = &mut self.db_conn.get()?;
        Message::add_content(self.message_id, message, conn)?;
        let message = Message::find(self.message_id, conn)?;
        self.window.emit("message", message)?;
        Ok(())
    }

    fn on_error(&self, err: ChatGPTError) -> ChatGPTResult<()> {
        log::error!("Connection Error: {err:?}");
        let conn = &mut self.db_conn.get()?;
        Message::update_status(self.message_id, Status::Error, conn)?;
        let message = Message::find(self.message_id, conn)?;
        self.window.emit("message", message)?;
        Ok(())
    }

    fn on_close(&self) -> ChatGPTResult<()> {
        log::info!("Connection Closed!");
        let conn = &mut self.db_conn.get()?;
        Message::update_status(self.message_id, Status::Normal, conn)?;
        let message = Message::find(self.message_id, conn)?;
        self.window.emit("message", message)?;
        Ok(())
    }
}

impl<R> FetchRunner for Fetch<R>
where
    R: Runtime,
{
    fn get_adapter(&self) -> &str {
        self.template.adapter.as_str()
    }

    fn get_template(&self) -> &serde_json::Value {
        &self.template.template
    }

    fn get_config(&self) -> &ChatGPTConfig {
        &self.config
    }

    fn get_history(&self) -> Vec<FetchMessage> {
        let mut prompts_messages = self
            .template
            .prompts
            .iter()
            .map(|prompt| FetchMessage::new(prompt.role, prompt.prompt.clone()))
            .collect::<Vec<_>>();
        match self.template.mode {
            Mode::Contextual => {
                let history_messages = self
                    .history_messages
                    .iter()
                    .filter(|message| message.status == Status::Normal)
                    .map(|Message { role, content, .. }| FetchMessage {
                        content: content.send_content().to_string(),
                        role: *role,
                    });
                prompts_messages.extend(history_messages);
            }
            Mode::Single => {}
            Mode::AssistantOnly => {
                let history = self
                    .history_messages
                    .iter()
                    .filter(|message| message.status == Status::Normal)
                    .map(|Message { role, content, .. }| FetchMessage {
                        content: content.send_content().to_string(),
                        role: *role,
                    })
                    .collect::<Vec<_>>();
                prompts_messages.extend(
                    history
                        .into_iter()
                        .filter(|message| message.role == Role::Assistant),
                );
            }
        }
        prompts_messages.push(FetchMessage {
            content: self.user_message.content.send_content().to_string(),
            role: self.user_message.role,
        });
        prompts_messages
    }
}

async fn _fetch<R: Runtime>(
    app_handle: AppHandle<R>,
    state: tauri::State<'_, DbConn>,
    id: i32,
    content: String,
    extension_name: Option<String>,
) -> ChatGPTResult<i32> {
    let window = app_handle
        .get_webview_window("main")
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
    let user_new_message = NewMessage::new(
        id,
        Role::User,
        Content::Text(content.clone()),
        Status::Normal,
    );
    let user_message = Message::insert(user_new_message, conn)?;
    window.emit("message", &user_message)?;

    // init bot message
    let bot_new_message = NewMessage::new(
        id,
        Role::Assistant,
        Content::Text("".to_string()),
        Status::Loading,
    );
    let message = Message::insert(bot_new_message, conn)?;
    let message_id = message.id;
    window.emit("message", message)?;

    // extension
    let state = state.inner().clone();
    let extension_container = ExtensionContainer::load_from_app(&app_handle)?;
    let extension = match extension_name {
        Some(extension_name) => {
            let extension = extension_container
                .get_extension(&extension_name, &app_handle)
                .await?;
            Some(extension)
        }
        None => None,
    };

    // update user message content
    let user_content = Fetch::<R>::get_new_user_content(content, extension).await?;
    Message::update_content(user_message.id, &user_content, conn)?;
    let user_message = Message::find(user_message.id, conn)?;
    window.emit("message", &user_message)?;

    let fetch = Fetch {
        message_id,
        db_conn: state,
        window,
        config,
        history_messages: conversation.messages,
        template,
        user_message,
    };
    let stream = fetch.fetch();
    pin_mut!(stream);
    log::info!("Connection Opened!");
    while let Some(message) = stream.next().await {
        match message {
            Ok(message) => fetch.on_message(message)?,
            Err(error) => fetch.on_error(error)?,
        }
    }
    fetch.on_close()?;
    Ok(message_id)
}
