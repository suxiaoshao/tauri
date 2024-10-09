use crate::{
    errors::{ChatGPTError, ChatGPTResult},
    fetch::{ChatRequest, ChatResponse, FetchRunner, Message as FetchMessage},
    store::{Conversation, ConversationTemplate, DbConn, Mode, NewMessage, Role, Status},
};
use crate::{plugins::ChatGPTConfig, store::Message};
use tauri::{AppHandle, Emitter, Manager, Runtime, WebviewWindow};

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
    window: WebviewWindow<R>,
    config: ChatGPTConfig,
    template: ConversationTemplate,
    messages: Vec<Message>,
    user_message: Message,
}

impl<R> FetchRunner for Fetch<R>
where
    R: Runtime,
{
    fn get_body(&self) -> ChatGPTResult<ChatRequest<'_>> {
        let mut messages = self
            .template
            .prompts
            .iter()
            .map(|prompt| FetchMessage::new(prompt.role, prompt.prompt.as_str()))
            .collect::<Vec<_>>();
        match self.template.mode {
            Mode::Contextual => {
                messages.extend(
                    self.messages
                        .iter()
                        .filter(|message| message.status == Status::Normal)
                        .map(|message| FetchMessage::new(message.role, message.content.as_str())),
                );
            }
            Mode::Single => {}
            Mode::AssistantOnly => {
                messages.extend(
                    self.messages
                        .iter()
                        .filter(|message| {
                            message.role == Role::Assistant && message.status == Status::Normal
                        })
                        .map(|message| FetchMessage::new(message.role, message.content.as_str())),
                );
            }
        }
        messages.push(FetchMessage::new(
            self.user_message.role,
            self.user_message.content.as_str(),
        ));

        Ok(ChatRequest {
            messages,
            model: self.template.model.as_str(),
            stream: true,
            temperature: self.template.temperature,
            top_p: self.template.top_p,
            n: self.template.n,
            max_tokens: self.template.max_tokens,
            presence_penalty: self.template.presence_penalty,
            frequency_penalty: self.template.frequency_penalty,
        })
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
    let user_new_message = NewMessage::new(id, Role::User, content, Status::Normal);
    let user_message = Message::insert(user_new_message, conn)?;
    window.emit("message", &user_message)?;

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
        messages: conversation.messages,
        template,
        user_message,
    };
    fetch.fetch().await?;

    Ok(message_id)
}
