use serde::{Deserialize, Serialize};
use tauri::{Manager, Runtime};
use time::OffsetDateTime;

use crate::{
    errors::ChatGPTResult,
    fetch::{ChatRequest, ChatResponse, FetchRunner},
    plugins::ChatGPTConfig,
    store::{
        deserialize_offset_date_time, serialize_offset_date_time, ConversationTemplate, DbConn,
        Mode, Role, Status,
    },
};

#[derive(Debug, Serialize, Clone, Deserialize, PartialEq, Eq)]
pub struct TemporaryMessage {
    pub id: i32,
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

pub struct TemporaryHistory {
    pub template_id: i32,
    pub messages: Vec<TemporaryMessage>,
}

#[tauri::command]
pub(super) fn init_temporary_conversation<R: Runtime>(
    state: tauri::State<'_, DbConn>,
    app: tauri::AppHandle<R>,
    template_id: i32,
) -> ChatGPTResult<Vec<TemporaryMessage>> {
    let conn = &mut state.get()?;
    let messages = vec![];
    let history = TemporaryHistory {
        template_id,
        messages,
    };
    app.manage(history);
    Ok(vec![])
}

#[tauri::command(async)]
pub async fn temporary_fetch<R: Runtime>(
    app: tauri::AppHandle<R>,
    state: tauri::State<'_, TemporaryHistory>,
    conn: tauri::State<'_, DbConn>,
    content: String,
) -> ChatGPTResult<()> {
    let TemporaryHistory {
        template_id,
        messages,
    } = state.inner();
    let messages = messages.clone();
    let config = ChatGPTConfig::get(&app)?;
    let conn = &mut conn.get()?;
    let mut template = ConversationTemplate::find(*template_id, conn)?;
    template.mode = Mode::Contextual;
    let mut fetch = TemporaryFetch {
        config,
        content,
        messages,
        template,
    };
    fetch.fetch().await?;
    Ok(())
}

struct TemporaryFetch {
    config: ChatGPTConfig,
    template: ConversationTemplate,
    messages: Vec<TemporaryMessage>,
    content: String,
}

impl FetchRunner for TemporaryFetch {
    fn get_body(&self) -> ChatGPTResult<ChatRequest<'_>> {
        let request = ChatRequest::new(self.messages.as_slice(), &self.template, &self.content);
        Ok(request)
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
        todo!()
    }

    fn on_error(&mut self, err: reqwest_eventsource::Error) -> ChatGPTResult<()> {
        todo!()
    }

    fn on_close(&mut self) -> ChatGPTResult<()> {
        todo!()
    }

    fn url(&self) -> &str {
        self.config.url.as_str()
    }
}
