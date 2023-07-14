use tauri::{Invoke, Manager, Runtime};

use crate::{
    errors::ChatGPTResult,
    fetch::{fetch as http_fetch, ChatRequest},
};

use super::config::ChatGPTConfig;

pub struct ChatPlugin;

impl<R: Runtime> tauri::plugin::Plugin<R> for ChatPlugin {
    fn name(&self) -> &'static str {
        "chat"
    }
    fn extend_api(&mut self, invoke: Invoke<R>) {
        let handle: Box<dyn Fn(Invoke<R>) + Send + Sync> =
            Box::new(tauri::generate_handler![fetch]);
        (handle)(invoke);
    }
}
// remember to call `.manage(MyState::default())`
#[tauri::command(async)]
async fn fetch<R: Runtime>(
    app_handle: tauri::AppHandle<R>,
    body: ChatRequest,
) -> ChatGPTResult<()> {
    let config = ChatGPTConfig::get(&app_handle)?;
    let api_key = config.get_api_key()?;
    http_fetch(api_key, &body, |x| {
        app_handle.emit_to("main", "fetch", &x).unwrap();
    })
    .await?;
    Ok(())
}
