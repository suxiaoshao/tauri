use tauri::{Emitter, Manager, Runtime};

use crate::{create_main_window, errors::ChatGPTResult};

pub struct UrlSchema;

const ROUTER_EVENT: &str = "router_event";

impl<R: Runtime> tauri::plugin::Plugin<R> for UrlSchema {
    fn name(&self) -> &'static str {
        "url_schema"
    }
}

#[derive(serde::Serialize, Clone)]
pub struct RouterEvent {
    path: String,
    #[serde(rename = "isUpdate")]
    is_update: bool,
}

impl RouterEvent {
    pub fn new(path: String, is_update: bool) -> Self {
        Self { path, is_update }
    }
}

pub fn router_emit_to_main<R: Runtime, M: Manager<R>>(
    event: RouterEvent,
    app_handle: &M,
) -> ChatGPTResult<()> {
    let window = match app_handle.get_webview_window("main") {
        Some(window) => window,
        None => create_main_window(app_handle, event.path.as_str())?,
    };
    window.emit(ROUTER_EVENT, event)?;
    Ok(())
}
