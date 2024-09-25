use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Runtime, WindowBuilder};
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

use super::TEMPORARY_WINDOW;

const TEMPORARY_MESSAGE_EVENT: &str = "temporary_message";

#[derive(Default)]
pub struct TemporaryStore {
    persistent_conversations: HashMap<usize, TemporaryConversation>,
    autoincrement_id: usize,
    temp_conversation: Option<TemporaryConversation>,
}

impl TemporaryStore {
    fn update_temp_conversation(&mut self, conversation: TemporaryConversation) {
        self.temp_conversation = Some(conversation)
    }
    fn update_temp_conversation_by_template_id(&mut self, template_id: i32) {
        self.temp_conversation = Some(TemporaryConversation {
            template_id,
            messages: vec![],
            autoincrement_id: 0,
        })
    }
    fn get_temp_conversation(&mut self) -> ChatGPTResult<TemporaryConversation> {
        match &self.temp_conversation {
            Some(data) => Ok(data.clone()),
            None => Err(ChatGPTError::TemporaryConversationUninitialized),
        }
    }
    fn delete_temp_conversation(&mut self, id: usize) -> ChatGPTResult<Vec<TemporaryMessage>> {
        let temp_conversation = match &mut self.temp_conversation {
            Some(data) => data,
            None => return Err(ChatGPTError::TemporaryConversationUninitialized),
        };
        let position = temp_conversation.messages.iter().position(|m| m.id == id);
        match position {
            Some(position) => {
                temp_conversation.messages.remove(position);
                Ok(temp_conversation.messages.clone())
            }
            None => Err(ChatGPTError::TemporaryMessageNotFound(id)),
        }
    }
    fn separate_window(&mut self) -> ChatGPTResult<usize> {
        let temp_conversation = match self.temp_conversation.take() {
            Some(data) => data,
            None => return Err(ChatGPTError::TemporaryConversationUninitialized),
        };
        self.autoincrement_id += 1;
        self.persistent_conversations
            .insert(self.autoincrement_id, temp_conversation);
        Ok(self.autoincrement_id)
    }
}

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

#[derive(Clone)]
pub struct TemporaryConversation {
    pub template_id: i32,
    pub messages: Vec<TemporaryMessage>,
    autoincrement_id: usize,
}

impl TemporaryConversation {
    fn new_id(&mut self) -> usize {
        self.autoincrement_id += 1;
        self.autoincrement_id
    }

    fn add_message(
        &mut self,
        now: OffsetDateTime,
        role: Role,
        content: String,
        status: Status,
    ) -> &TemporaryMessage {
        let id = self.new_id();
        let message = TemporaryMessage {
            id,
            role,
            content,
            status,
            created_time: now,
            updated_time: now,
            start_time: now,
            end_time: now,
        };
        self.messages.push(message);
        self.messages.last().unwrap()
    }
}

#[tauri::command]
pub(super) fn init_temporary_conversation(
    state: tauri::State<'_, Arc<Mutex<TemporaryStore>>>,
    template_id: i32,
) -> ChatGPTResult<Vec<TemporaryMessage>> {
    state
        .lock()?
        .update_temp_conversation_by_template_id(template_id);
    Ok(vec![])
}

#[tauri::command]
pub(super) fn delete_temporary_message(
    state: tauri::State<'_, Arc<Mutex<TemporaryStore>>>,
    id: usize,
) -> ChatGPTResult<Vec<TemporaryMessage>> {
    let data = state.lock()?.delete_temp_conversation(id)?;
    Ok(data)
}
#[tauri::command(async)]
pub(super) fn separate_window<R: Runtime>(
    state: tauri::State<'_, Arc<Mutex<TemporaryStore>>>,
    app_handle: AppHandle<R>,
    window: tauri::Window<R>,
) -> ChatGPTResult<()> {
    window.close()?;
    let id = state.lock()?.separate_window()?;
    create_window(&app_handle, id)?;
    Ok(())
}

fn create_window<R: Runtime>(app: &AppHandle<R>, id: usize) -> ChatGPTResult<()> {
    let window = WindowBuilder::new(
        app,
        format!("{}-{}", TEMPORARY_WINDOW, id),
        tauri::WindowUrl::App("/temporary_conversation".into()),
    )
    .title("Temporary Conversation")
    .inner_size(800.0, 600.0)
    .transparent(true)
    .center();
    window.build()?;
    Ok(())
}

#[tauri::command(async)]
pub async fn temporary_fetch<R: Runtime>(
    app: tauri::AppHandle<R>,
    window: tauri::Window<R>,
    state: tauri::State<'_, Arc<Mutex<TemporaryStore>>>,
    conn: tauri::State<'_, DbConn>,
    content: String,
) -> ChatGPTResult<()> {
    let mut conversation = state.lock()?.get_temp_conversation()?;
    let template_id = conversation.template_id;

    let now = OffsetDateTime::now_utc();
    let user_message = conversation.add_message(now, Role::User, content, Status::Normal);
    window.emit(TEMPORARY_MESSAGE_EVENT, &user_message)?;

    let config = ChatGPTConfig::get(&app)?;

    let conn = &mut conn.get()?;
    let mut template = ConversationTemplate::find(template_id, conn)?;
    template.mode = Mode::Contextual;

    let new_id = conversation.new_id();

    let assistant_message = TemporaryMessage {
        id: new_id,
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
        template,
        assistant_message,
        window,
        conversation,
    };
    fetch.fetch().await?;

    let TemporaryFetch {
        mut conversation,
        assistant_message,
        ..
    } = fetch;
    conversation.messages.push(assistant_message);
    state.lock()?.update_temp_conversation(conversation);

    Ok(())
}

struct TemporaryFetch<R: Runtime> {
    config: ChatGPTConfig,
    template: ConversationTemplate,
    assistant_message: TemporaryMessage,
    window: tauri::Window<R>,
    conversation: TemporaryConversation,
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
            self.conversation
                .messages
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
