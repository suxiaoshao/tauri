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

#[derive(Serialize, Clone)]
pub struct TemporaryConversation {
    #[serde(rename = "template")]
    pub template: ConversationTemplate,
    #[serde(rename = "persistentId")]
    persistent_id: Option<usize>,
    pub messages: Vec<TemporaryMessage>,
    #[serde(rename = "autoincrementId")]
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

#[derive(Default)]
pub struct TemporaryStore {
    persistent_conversations: HashMap<usize, TemporaryConversation>,
    autoincrement_id: usize,
    temp_conversation: Option<TemporaryConversation>,
}

impl TemporaryStore {
    fn update_temp_conversation(
        &mut self,
        conversation: TemporaryConversation,
        persistent_id: Option<usize>,
    ) -> ChatGPTResult<()> {
        let old_conversation = self.get_temp_conversation_mut(persistent_id)?;
        *old_conversation = conversation;
        Ok(())
    }
    fn update_temp_conversation_by_template_id(&mut self, template: ConversationTemplate) {
        self.temp_conversation = Some(TemporaryConversation {
            template,
            messages: vec![],
            autoincrement_id: 0,
            persistent_id: None,
        })
    }
    fn get_temp_conversation_mut(
        &mut self,
        persistent_id: Option<usize>,
    ) -> ChatGPTResult<&mut TemporaryConversation> {
        match persistent_id {
            Some(id) => match self.persistent_conversations.get_mut(&id) {
                Some(data) => Ok(data),
                None => Err(ChatGPTError::TemporaryConversationNotFound(id)),
            },
            None => match &mut self.temp_conversation {
                Some(data) => Ok(data),
                None => Err(ChatGPTError::TemporaryConversationUninitialized),
            },
        }
    }
    fn get_temp_conversation(
        &mut self,
        persistent_id: Option<usize>,
    ) -> ChatGPTResult<TemporaryConversation> {
        Ok(self.get_temp_conversation_mut(persistent_id)?.clone())
    }
    fn delete_temp_conversation_message(
        &mut self,
        persistent_id: Option<usize>,
        message_id: usize,
    ) -> ChatGPTResult<()> {
        let temp_conversation = self.get_temp_conversation_mut(persistent_id)?;
        let position = temp_conversation
            .messages
            .iter()
            .position(|m| m.id == message_id);
        match position {
            Some(position) => {
                temp_conversation.messages.remove(position);
                Ok(())
            }
            None => Err(ChatGPTError::TemporaryMessageNotFound(message_id)),
        }
    }
    fn separate_window(&mut self) -> ChatGPTResult<usize> {
        let mut temp_conversation = match self.temp_conversation.take() {
            Some(data) => data,
            None => return Err(ChatGPTError::TemporaryConversationUninitialized),
        };
        self.autoincrement_id += 1;
        temp_conversation.persistent_id = Some(self.autoincrement_id);
        self.persistent_conversations
            .insert(self.autoincrement_id, temp_conversation);
        Ok(self.autoincrement_id)
    }
    fn delete_conversation(&mut self, persistent_id: Option<usize>) {
        let id = match persistent_id {
            Some(id) => id,
            None => {
                self.temp_conversation = None;
                return;
            }
        };
        self.persistent_conversations.remove(&id);
    }
    fn clear_conversation(&mut self, persistent_id: Option<usize>) -> ChatGPTResult<()> {
        let conversation = self.get_temp_conversation_mut(persistent_id)?;
        conversation.messages.clear();
        Ok(())
    }
}

#[derive(Debug, Serialize, Clone, PartialEq, Eq)]
pub struct TemporaryMessageEvent<'a> {
    #[serde(rename = "persistentId")]
    persistent_id: Option<usize>,
    message: &'a TemporaryMessage,
}

impl<'a> TemporaryMessageEvent<'a> {
    fn new(message: &'a TemporaryMessage, persistent_id: Option<usize>) -> Self {
        Self {
            persistent_id,
            message,
        }
    }
}

#[tauri::command]
pub(super) fn init_temporary_conversation(
    state: tauri::State<'_, Arc<Mutex<TemporaryStore>>>,
    conn: tauri::State<'_, DbConn>,
    template_id: i32,
) -> ChatGPTResult<Vec<TemporaryMessage>> {
    let conn = &mut conn.get()?;
    let mut template = ConversationTemplate::find(template_id, conn)?;
    template.mode = Mode::Contextual;
    state
        .lock()?
        .update_temp_conversation_by_template_id(template);
    Ok(vec![])
}

#[tauri::command]
pub(super) fn delete_temporary_message(
    state: tauri::State<'_, Arc<Mutex<TemporaryStore>>>,
    persistent_id: Option<usize>,
    message_id: usize,
) -> ChatGPTResult<()> {
    state
        .lock()?
        .delete_temp_conversation_message(persistent_id, message_id)?;
    Ok(())
}
#[tauri::command(async)]
pub(super) fn separate_window<R: Runtime>(
    state: tauri::State<'_, Arc<Mutex<TemporaryStore>>>,
    app_handle: AppHandle<R>,
    window: tauri::Window<R>,
) -> ChatGPTResult<()> {
    window.close()?;
    let id = state.lock()?.separate_window()?;
    create_persistent_window(&app_handle, id)?;
    Ok(())
}

#[tauri::command]
pub(super) fn get_temporary_conversation(
    persistent_id: Option<usize>,
    state: tauri::State<'_, Arc<Mutex<TemporaryStore>>>,
) -> ChatGPTResult<TemporaryConversation> {
    state.lock()?.get_temp_conversation(persistent_id)
}

fn create_persistent_window<R: Runtime>(app: &AppHandle<R>, id: usize) -> ChatGPTResult<()> {
    let window = WindowBuilder::new(
        app,
        format!("{}-{}", TEMPORARY_WINDOW, id),
        tauri::WindowUrl::App(format!("/temporary_conversation/detail?persistentId={}", id).into()),
    )
    .title("Temporary Conversation")
    .inner_size(800.0, 600.0)
    .transparent(true)
    .center();
    window.build()?;
    Ok(())
}

#[tauri::command]
pub fn delete_temporary_conversation(
    persistent_id: Option<usize>,
    state: tauri::State<'_, Arc<Mutex<TemporaryStore>>>,
) -> ChatGPTResult<()> {
    state.lock()?.delete_conversation(persistent_id);
    Ok(())
}

#[tauri::command]
pub fn clear_temporary_conversation(
    persistent_id: Option<usize>,
    state: tauri::State<'_, Arc<Mutex<TemporaryStore>>>,
) -> ChatGPTResult<()> {
    state.lock()?.clear_conversation(persistent_id)?;
    Ok(())
}

#[tauri::command(async)]
pub async fn temporary_fetch<R: Runtime>(
    app: tauri::AppHandle<R>,
    window: tauri::Window<R>,
    state: tauri::State<'_, Arc<Mutex<TemporaryStore>>>,
    conn: tauri::State<'_, DbConn>,
    content: String,
    persistent_id: Option<usize>,
) -> ChatGPTResult<()> {
    let mut conversation = state.lock()?.get_temp_conversation(persistent_id)?;

    let now = OffsetDateTime::now_utc();
    let user_message = conversation.add_message(now, Role::User, content, Status::Normal);
    window.emit(
        TEMPORARY_MESSAGE_EVENT,
        TemporaryMessageEvent::new(user_message, persistent_id),
    )?;

    let config = ChatGPTConfig::get(&app)?;

    let conn = &mut conn.get()?;
    let mut template = ConversationTemplate::find(conversation.template.id, conn)?;
    template.mode = Mode::Contextual;
    conversation.template = template;

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
    window.emit(
        TEMPORARY_MESSAGE_EVENT,
        TemporaryMessageEvent::new(&assistant_message, persistent_id),
    )?;

    let mut fetch = TemporaryFetch {
        config,
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
    state
        .lock()?
        .update_temp_conversation(conversation, persistent_id)?;

    Ok(())
}

struct TemporaryFetch<R: Runtime> {
    config: ChatGPTConfig,
    assistant_message: TemporaryMessage,
    window: tauri::Window<R>,
    conversation: TemporaryConversation,
}

impl<R: Runtime> FetchRunner for TemporaryFetch<R> {
    fn get_body(&self) -> ChatGPTResult<ChatRequest<'_>> {
        let mut messages = self
            .conversation
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
            model: self.conversation.template.model.as_str(),
            messages,
            stream: true,
            temperature: self.conversation.template.temperature,
            top_p: self.conversation.template.top_p,
            n: self.conversation.template.n,
            max_tokens: self.conversation.template.max_tokens,
            presence_penalty: self.conversation.template.presence_penalty,
            frequency_penalty: self.conversation.template.frequency_penalty,
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
        self.window.emit(
            TEMPORARY_MESSAGE_EVENT,
            TemporaryMessageEvent::new(&self.assistant_message, self.conversation.persistent_id),
        )?;
        Ok(())
    }

    fn on_error(&mut self, err: reqwest_eventsource::Error) -> ChatGPTResult<()> {
        log::error!("Connection Error: {:?}", err);
        self.assistant_message.update_status(Status::Error);
        self.window.emit(
            TEMPORARY_MESSAGE_EVENT,
            TemporaryMessageEvent::new(&self.assistant_message, self.conversation.persistent_id),
        )?;
        Ok(())
    }

    fn on_close(&mut self) -> ChatGPTResult<()> {
        log::info!("Connection Closed!");
        self.assistant_message.update_status(Status::Normal);
        self.window.emit(
            TEMPORARY_MESSAGE_EVENT,
            TemporaryMessageEvent::new(&self.assistant_message, self.conversation.persistent_id),
        )?;
        Ok(())
    }

    fn url(&self) -> &str {
        self.config.url.as_str()
    }
}
