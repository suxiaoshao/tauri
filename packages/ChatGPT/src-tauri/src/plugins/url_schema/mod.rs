use tauri::{Manager, Runtime};

use crate::{create_main_window, errors::ChatGPTResult};

pub struct UrlSchema;

const ROUTER_EVENT: &str = "router_event";

impl<R: Runtime> tauri::plugin::Plugin<R> for UrlSchema {
    fn name(&self) -> &'static str {
        "url_schema"
    }
}

#[derive(serde::Serialize, Clone)]
pub struct RouterEvent<'a> {
    path: &'a str,
    #[serde(rename = "conversationSelected")]
    conversation_selected: Option<ConversationSelected>,
    #[serde(rename = "isUpdate")]
    is_update: bool,
}

impl<'a> RouterEvent<'a> {
    pub fn new(
        path: &'a str,
        conversation_selected: Option<ConversationSelected>,
        is_update: bool,
    ) -> Self {
        Self {
            path,
            conversation_selected,
            is_update,
        }
    }
}
#[derive(serde::Serialize, Clone)]
#[serde(tag = "tag", content = "value")]
pub enum ConversationSelected {
    Forder(i32),
    Conversation(i32),
}

pub fn router_emit_to_main<R: Runtime, M: Manager<R>>(
    event: RouterEvent,
    app_handle: &M,
) -> ChatGPTResult<()> {
    let window = match app_handle.get_window("main") {
        Some(window) => window,
        None => create_main_window(app_handle)?,
    };
    window.emit(ROUTER_EVENT, event)?;
    Ok(())
}
