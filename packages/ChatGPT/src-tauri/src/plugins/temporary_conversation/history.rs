use crate::{
    errors::{ChatGPTError, ChatGPTResult},
    extensions::ExtensionContainer,
    fetch::{FetchRunner, Message as FetchMessage},
    plugins::{
        ChatGPTConfig,
        url_schema::{RouterEvent, router_emit_to_main},
    },
    store::{
        Content, Conversation, ConversationTemplate, DbConn, Message, Mode, NewConversation, Role,
        Status, deserialize_offset_date_time, serialize_offset_date_time,
    },
};
use futures::{StreamExt, pin_mut};
use serde::{Deserialize, Serialize};
use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};
use tauri::{AppHandle, Emitter, Runtime, WebviewWindowBuilder};
use time::OffsetDateTime;

use super::TEMPORARY_WINDOW;

const TEMPORARY_MESSAGE_EVENT: &str = "temporary_message";

#[derive(Debug, Serialize, Clone, Deserialize, PartialEq, Eq)]
pub struct TemporaryMessage {
    pub id: usize,
    pub role: Role,
    pub content: Content,
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
        self.content += content;
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
        content: Content,
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
        self.messages.last_mut().unwrap()
    }
    fn update_message_content(
        &mut self,
        id: usize,
        content: Content,
    ) -> ChatGPTResult<&TemporaryMessage> {
        let now = OffsetDateTime::now_utc();
        let message = self.messages.iter_mut().find(|m| m.id == id);
        if let Some(message) = message {
            message.content = content;
            message.updated_time = now;
            message.end_time = now;
            Ok(message)
        } else {
            Err(ChatGPTError::TemporaryMessageNotFound(id))
        }
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
    ) -> ChatGPTResult<&TemporaryConversation> {
        Ok(self.get_temp_conversation_mut(persistent_id)?)
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
    fn get_temp_conversation_message_mut(
        &mut self,
        persistent_id: Option<usize>,
        message_id: usize,
    ) -> ChatGPTResult<&mut TemporaryMessage> {
        let temp_conversation = self.get_temp_conversation_mut(persistent_id)?;
        let posision = temp_conversation
            .messages
            .iter()
            .position(|m| m.id == message_id);
        match posision {
            Some(position) => Ok(temp_conversation
                .messages
                .get_mut(position)
                .ok_or(ChatGPTError::TemporaryMessageNotFound(message_id))?),
            None => Err(ChatGPTError::TemporaryMessageNotFound(message_id)),
        }
    }
    fn get_temp_conversation_message(
        &mut self,
        persistent_id: Option<usize>,
        message_id: usize,
    ) -> ChatGPTResult<&TemporaryMessage> {
        let message = self.get_temp_conversation_message_mut(persistent_id, message_id)?;
        Ok(message)
    }
    fn update_temp_conversation_message(
        &mut self,
        persistent_id: Option<usize>,
        message_id: usize,
        content: Content,
    ) -> ChatGPTResult<&mut TemporaryMessage> {
        let message = self.get_temp_conversation_message_mut(persistent_id, message_id)?;
        message.content = content;
        Ok(message)
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
pub fn init_temporary_conversation(
    state: tauri::State<Arc<Mutex<TemporaryStore>>>,
    conn: tauri::State<DbConn>,
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
pub fn delete_temporary_message(
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
pub fn separate_window<R: Runtime>(
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
pub fn get_temporary_conversation(
    persistent_id: Option<usize>,
    state: tauri::State<'_, Arc<Mutex<TemporaryStore>>>,
) -> ChatGPTResult<TemporaryConversation> {
    state.lock()?.get_temp_conversation(persistent_id).cloned()
}

fn create_persistent_window<R: Runtime>(app: &AppHandle<R>, id: usize) -> ChatGPTResult<()> {
    let window = WebviewWindowBuilder::new(
        app,
        format!("{TEMPORARY_WINDOW}-{id}"),
        tauri::WebviewUrl::App(format!("/temporary_conversation/detail?persistentId={id}").into()),
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

#[derive(Debug, Deserialize, Clone)]
pub struct SaveTemporaryConversation {
    title: String,
    #[serde(rename = "folderId")]
    folder_id: Option<i32>,
    icon: String,
    info: Option<String>,
    #[serde(rename = "persistentId")]
    persistent_id: Option<usize>,
}

#[tauri::command(async)]
pub fn save_temporary_conversation<R: Runtime>(
    state: tauri::State<'_, Arc<Mutex<TemporaryStore>>>,
    conn: tauri::State<'_, DbConn>,
    data: SaveTemporaryConversation,
    window: tauri::Window<R>,
    app_handle: AppHandle<R>,
) -> ChatGPTResult<()> {
    let SaveTemporaryConversation {
        title,
        folder_id,
        icon,
        info,
        persistent_id,
    } = data;
    let conversation = state.lock()?.get_temp_conversation(persistent_id)?.clone();
    let conn = &mut conn.get()?;
    let id = conn.immediate_transaction(|conn| {
        let new_conversation = Conversation::insert(
            NewConversation {
                title,
                folder_id,
                icon,
                info,
                template_id: conversation.template.id,
            },
            conn,
        )?;
        Message::insert_many(
            conversation.messages,
            new_conversation.path,
            new_conversation.id,
            conn,
        )?;
        Ok::<_, ChatGPTError>(new_conversation.id)
    })?;

    state.lock()?.delete_conversation(persistent_id);

    let path = format!("/?selectedType=conversation&selectedId={id}");
    router_emit_to_main(RouterEvent::new(path, true), &app_handle)?;
    window.close()?;
    Ok(())
}

#[tauri::command]
pub fn get_temporary_message(
    persistent_id: Option<usize>,
    message_id: usize,
    state: tauri::State<'_, Arc<Mutex<TemporaryStore>>>,
) -> ChatGPTResult<TemporaryMessage> {
    let message = state
        .lock()?
        .get_temp_conversation_message(persistent_id, message_id)?
        .clone();
    Ok(message)
}

#[tauri::command]
pub fn update_temporary_message<R: Runtime>(
    app: tauri::AppHandle<R>,
    state: tauri::State<'_, Arc<Mutex<TemporaryStore>>>,
    persistent_id: Option<usize>,
    message_id: usize,
    content: Content,
) -> ChatGPTResult<()> {
    let message = state
        .lock()?
        .update_temp_conversation_message(persistent_id, message_id, content)?
        .clone();
    app.emit(
        TEMPORARY_MESSAGE_EVENT,
        TemporaryMessageEvent::new(&message, persistent_id),
    )?;
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
    extension_name: Option<String>,
) -> ChatGPTResult<()> {
    let mut conversation = state.lock()?.get_temp_conversation(persistent_id)?.clone();
    let now = OffsetDateTime::now_utc();
    let config = ChatGPTConfig::get(&app)?;

    // update conversation template
    let conn = &mut conn.get()?;
    let mut template = ConversationTemplate::find(conversation.template.id, conn)?;
    template.mode = Mode::Contextual;
    conversation.template = template;

    // user message
    let user_message = conversation.add_message(
        now,
        Role::User,
        match &extension_name {
            Some(extension_name) => Content::Extension {
                source: content.clone(),
                content: String::new(),
                extension_name: extension_name.clone(),
            },
            None => Content::Text(content.clone()),
        },
        Status::Normal,
    );
    window.emit(
        TEMPORARY_MESSAGE_EVENT,
        TemporaryMessageEvent::new(user_message, persistent_id),
    )?;
    let user_id = user_message.id;

    // initialize assistant conversation
    let new_id = conversation.new_id();
    let mut assistant_message = TemporaryMessage {
        id: new_id,
        role: Role::Assistant,
        content: match &extension_name {
            Some(extension_name) => Content::Extension {
                source: String::new(),
                content: String::new(),
                extension_name: extension_name.clone(),
            },
            None => Content::Text(String::new()),
        },
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

    // extension
    let extension_container = ExtensionContainer::load_from_app(&app)?;
    let extension = match extension_name {
        Some(extension_name) => {
            let extension = extension_container
                .get_extension(&extension_name, &app)
                .await?;
            Some(extension)
        }
        None => None,
    };

    // update user message content
    let user_content = TemporaryFetch::<R>::get_new_user_content(content, extension).await?;
    let user_message = conversation.update_message_content(user_id, user_content)?;
    window.emit(
        TEMPORARY_MESSAGE_EVENT,
        TemporaryMessageEvent::new(user_message, persistent_id),
    )?;

    // fetch
    {
        let fetch = TemporaryFetch {
            config,
            window,
            conversation: &conversation,
        };
        let stream = fetch.fetch();
        pin_mut!(stream);
        log::info!("Connection Opened!");
        while let Some(message) = stream.next().await {
            match message {
                Ok(message) => fetch.on_message(message, &mut assistant_message)?,
                Err(error) => fetch.on_error(error, &mut assistant_message)?,
            }
        }
        fetch.on_close(&mut assistant_message)?;
    }

    // update conversation
    conversation.messages.push(assistant_message);
    state
        .lock()?
        .update_temp_conversation(conversation, persistent_id)?;

    Ok(())
}

struct TemporaryFetch<'a, R: Runtime> {
    config: ChatGPTConfig,
    window: tauri::Window<R>,
    conversation: &'a TemporaryConversation,
}

impl<R: Runtime> TemporaryFetch<'_, R> {
    fn on_message(
        &self,
        message: String,
        assistant_message: &mut TemporaryMessage,
    ) -> ChatGPTResult<()> {
        assistant_message.add_content(message);
        self.window.emit(
            TEMPORARY_MESSAGE_EVENT,
            TemporaryMessageEvent::new(assistant_message, self.conversation.persistent_id),
        )?;
        Ok(())
    }

    fn on_error(
        &self,
        err: ChatGPTError,
        assistant_message: &mut TemporaryMessage,
    ) -> ChatGPTResult<()> {
        log::error!("Connection Error: {err:?}");
        assistant_message.update_status(Status::Error);
        self.window.emit(
            TEMPORARY_MESSAGE_EVENT,
            TemporaryMessageEvent::new(assistant_message, self.conversation.persistent_id),
        )?;
        Ok(())
    }

    fn on_close(&self, assistant_message: &mut TemporaryMessage) -> ChatGPTResult<()> {
        log::info!("Connection Closed!");
        assistant_message.update_status(Status::Normal);
        self.window.emit(
            TEMPORARY_MESSAGE_EVENT,
            TemporaryMessageEvent::new(assistant_message, self.conversation.persistent_id),
        )?;
        Ok(())
    }
}

impl<R: Runtime> FetchRunner for TemporaryFetch<'_, R> {
    fn get_adapter(&self) -> &str {
        &self.conversation.template.adapter
    }

    fn get_template(&self) -> &serde_json::Value {
        &self.conversation.template.template
    }

    fn get_config(&self) -> &ChatGPTConfig {
        &self.config
    }

    fn get_history(&self) -> Vec<FetchMessage> {
        let mut prompts = self
            .conversation
            .template
            .prompts
            .iter()
            .map(|prompt| FetchMessage::new(prompt.role, prompt.prompt.clone()))
            .collect::<Vec<_>>();

        let messages = self
            .conversation
            .messages
            .iter()
            .filter(|message| message.status == Status::Normal)
            .map(|message| {
                FetchMessage::new(message.role, message.content.send_content().to_string())
            });

        prompts.extend(messages);
        prompts
    }
}
