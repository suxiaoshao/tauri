use log::warn;
use tauri::Runtime;

use crate::{create_main_window, errors::ChatGPTResult};

use self::created::on_created;

mod created;

#[cfg(target_os = "macos")]
pub(in crate::plugins) use created::WindowExt;

pub struct WindowPlugin;

impl<R: Runtime> tauri::plugin::Plugin<R> for WindowPlugin {
    fn name(&self) -> &'static str {
        "window-beautify"
    }
    fn initialize(
        &mut self,
        _app: &tauri::AppHandle<R>,
        _config: serde_json::Value,
    ) -> Result<(), Box<dyn std::error::Error>> {
        Ok(())
    }
    fn window_created(&mut self, window: tauri::Window<R>) {
        if let Err(err) = on_created(window) {
            warn!("window created error:{}", err)
        };
    }
    #[cfg(target_os = "macos")]
    fn on_event(&mut self, app: &tauri::AppHandle<R>, event: &tauri::RunEvent) {
        if let tauri::RunEvent::Reopen {
            has_visible_windows: false,
            ..
        } = event
        {
            let app = app.clone();
            tauri::async_runtime::spawn(async move {
                if let Err(err) = create_main(&app) {
                    log::warn!("window created error:{}", err)
                }
            });
        }
    }
}

fn create_main<R: Runtime>(app: &tauri::AppHandle<R>) -> ChatGPTResult<()> {
    create_main_window(app, "/")?;
    Ok(())
}
