use std::sync::{Arc, Mutex};

use serde::{Deserialize, Serialize};
use tauri::{Manager, Runtime};
use time::OffsetDateTime;

use crate::{
    errors::{ChatGPTError, ChatGPTResult},
    fetch::{ChatRequest, ChatResponse, FetchRunner, Message as FetchMessage},
    plugins::ChatGPTConfig,
    store::{
        deserialize_offset_date_time, serialize_offset_date_time, ConversationTemplate, DbConn,
        Mode, Role, Status,
    },
};

const TEMPORARY_MESSAGE_EVENT: &str = "temporary_message";

#[derive(Debug, Serialize, Clone, Deserialize, PartialEq, Eq)]
pub struct TemporaryMessage {
    pub id: usize,
    pub role: Role,
    pub content: String,
    pub status: Status,
    #[serde(
        rename = "createdTime",
        serialize_with = "serialize_offset_date_time",
        deserialize_with = "deserialize_offset_date_time"
    )]
    pub created_time: OffsetDateTime,
    #[serde(
        rename = "updatedTime",
        serialize_with = "serialize_offset_date_time",
        deserialize_with = "deserialize_offset_date_time"
    )]
    pub updated_time: OffsetDateTime,
    #[serde(
        rename = "startTime",
        serialize_with = "serialize_offset_date_time",
        deserialize_with = "deserialize_offset_date_time"
    )]
    pub start_time: OffsetDateTime,
    #[serde(
        rename = "endTime",
        serialize_with = "serialize_offset_date_time",
        deserialize_with = "deserialize_offset_date_time"
    )]
    pub end_time: OffsetDateTime,
}

impl TemporaryMessage {
    fn add_content(&mut self, content: String) {
        let now = OffsetDateTime::now_utc();
        self.content += &content;
        self.updated_time = now;
        self.end_time = now;
    }
    fn update_status(&mut self, status: Status) {
        let now = OffsetDateTime::now_utc();
        self.status = status;
        self.updated_time = now;
        self.end_time = now;
    }
}

pub struct TemporaryHistory {
    pub template_id: i32,
    pub messages: Vec<TemporaryMessage>,
}

trait TemporaryHistoryTrait {
    fn get_max_id(&self) -> usize;
    fn new_id(&self) -> usize {
        self.get_max_id() + 1
    }
}

impl TemporaryHistoryTrait for Vec<TemporaryMessage> {
    fn get_max_id(&self) -> usize {
        self.iter().map(|m| m.id).max().unwrap_or(0)
    }
}

impl TemporaryHistoryTrait for TemporaryHistory {
    fn get_max_id(&self) -> usize {
        self.messages.get_max_id()
    }
}

#[tauri::command]
pub(super) fn init_temporary_conversation<R: Runtime>(
    app: tauri::AppHandle<R>,
    template_id: i32,
) -> ChatGPTResult<Vec<TemporaryMessage>> {
    let messages = vec![];
    let history = TemporaryHistory {
        template_id,
        messages,
    };
    match app.try_state::<Arc<Mutex<TemporaryHistory>>>() {
        Some(old_history) => {
            let mut old_history = old_history.lock()?;
            *old_history = history;
        }
        None => {
            app.manage(Arc::new(Mutex::new(history)));
        }
    };
    Ok(vec![])
}

#[tauri::command]
pub(super) fn find_temporary_message(
    state: tauri::State<'_, Arc<Mutex<TemporaryHistory>>>,
    id: usize,
) -> ChatGPTResult<TemporaryMessage> {
    let message = state.lock()?.messages.iter().find(|m| m.id == id).cloned();
    match message {
        Some(message) => Ok(message),
        None => Err(ChatGPTError::TemporaryMessageNotFound(id)),
    }
}

#[tauri::command]
pub(super) fn delete_temporary_message(
    state: tauri::State<'_, Arc<Mutex<TemporaryHistory>>>,
    id: usize,
) -> ChatGPTResult<Vec<TemporaryMessage>> {
    let position = state.lock()?.messages.iter().position(|m| m.id == id);
    match position {
        Some(position) => {
            state.lock()?.messages.remove(position);
            Ok(state.lock()?.messages.clone())
        }
        None => Err(ChatGPTError::TemporaryMessageNotFound(id)),
    }
}

#[tauri::command(async)]
pub async fn temporary_fetch<R: Runtime>(
    app: tauri::AppHandle<R>,
    window: tauri::Window<R>,
    state: tauri::State<'_, Arc<Mutex<TemporaryHistory>>>,
    conn: tauri::State<'_, DbConn>,
    content: String,
) -> ChatGPTResult<()> {
    let template_id = state.lock()?.template_id;
    let mut messages = state.lock()?.messages.clone();

    let now = OffsetDateTime::now_utc();
    let user_message = TemporaryMessage {
        id: messages.new_id(),
        role: Role::User,
        content,
        status: Status::Normal,
        created_time: now,
        updated_time: now,
        start_time: now,
        end_time: now,
    };
    window.emit(TEMPORARY_MESSAGE_EVENT, &user_message)?;
    messages.push(user_message);

    let config = ChatGPTConfig::get(&app)?;

    let conn = &mut conn.get()?;
    let mut template = ConversationTemplate::find(template_id, conn)?;
    template.mode = Mode::Contextual;

    let assistant_message = TemporaryMessage {
        id: messages.new_id(),
        role: Role::Assistant,
        content: "".to_string(),
        status: Status::Loading,
        created_time: now,
        updated_time: now,
        start_time: now,
        end_time: now,
    };
    window.emit(TEMPORARY_MESSAGE_EVENT, &assistant_message)?;

    let mut fetch = TemporaryFetch {
        config,
        messages,
        template,
        assistant_message,
        window,
    };
    fetch.fetch().await?;

    let TemporaryFetch {
        mut messages,
        assistant_message,
        ..
    } = fetch;
    messages.push(assistant_message);
    let new_history = TemporaryHistory {
        template_id,
        messages,
    };
    *state.lock()? = new_history;
    Ok(())
}

struct TemporaryFetch<R: Runtime> {
    config: ChatGPTConfig,
    template: ConversationTemplate,
    messages: Vec<TemporaryMessage>,
    assistant_message: TemporaryMessage,
    window: tauri::Window<R>,
}

impl<R: Runtime> FetchRunner for TemporaryFetch<R> {
    fn get_body(&self) -> ChatGPTResult<ChatRequest<'_>> {
        let mut messages = self
            .template
            .prompts
            .iter()
            .map(|prompt| FetchMessage::new(prompt.role, prompt.prompt.as_str()))
            .collect::<Vec<_>>();
        messages.extend(
            self.messages
                .iter()
                .filter(|message| message.status == Status::Normal)
                .map(|message| FetchMessage::new(message.role, message.content.as_str())),
        );
        Ok(ChatRequest {
            model: self.template.model.as_str(),
            messages,
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

    fn on_message(&mut self, message: ChatResponse) -> ChatGPTResult<()> {
        let content = message
            .choices
            .into_iter()
            .filter_map(|choice| choice.delta.content)
            .collect::<String>();
        self.assistant_message.add_content(content);
        self.window
            .emit(TEMPORARY_MESSAGE_EVENT, &self.assistant_message)?;
        Ok(())
    }

    fn on_error(&mut self, err: reqwest_eventsource::Error) -> ChatGPTResult<()> {
        log::error!("Connection Error: {:?}", err);
        self.assistant_message.update_status(Status::Error);
        self.window
            .emit(TEMPORARY_MESSAGE_EVENT, &self.assistant_message)?;
        Ok(())
    }

    fn on_close(&mut self) -> ChatGPTResult<()> {
        log::info!("Connection Closed!");
        self.assistant_message.update_status(Status::Normal);
        self.window
            .emit(TEMPORARY_MESSAGE_EVENT, &self.assistant_message)?;
        Ok(())
    }

    fn url(&self) -> &str {
        self.config.url.as_str()
    }
}
