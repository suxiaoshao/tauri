use log::warn;
use serde_json::Value;
use tauri::{AppHandle, Manager, RunEvent, Runtime};

use self::created::on_created;

mod created;
mod shortcut;

pub struct WindowPlugin;

pub use shortcut::on_short;

impl<R: Runtime> tauri::plugin::Plugin<R> for WindowPlugin {
    fn name(&self) -> &'static str {
        "window-beautify"
    }
    fn initialize(
        &mut self,
        _app: &AppHandle<R>,
        _: Value,
    ) -> Result<(), Box<dyn std::error::Error>> {
        Ok(())
    }
    fn window_created(&mut self, window: tauri::Window<R>) {
        if let Err(err) = on_created(window) {
            warn!("window created error:{err}")
        };
    }
    fn on_event(&mut self, app: &AppHandle<R>, event: &tauri::RunEvent) {
        match event {
            RunEvent::WindowEvent {
                label,
                event: tauri::WindowEvent::Focused(false),
                ..
            } if label == "main" => match app.get_webview_window("main") {
                Some(window) => {
                    if let Err(err) = window.hide() {
                        warn!("main window hide error:{err}")
                    };
                }
                None => {
                    warn!("main window not found");
                }
            },
            _ => {}
        }
    }
}
