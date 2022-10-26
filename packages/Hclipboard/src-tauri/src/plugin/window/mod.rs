use serde_json::Value;
use tauri::{AppHandle, Runtime};

use self::{created::on_created, shortcut::manager_global_shortcut};

mod created;
mod shortcut;

pub struct WindowPlugin;

impl<R: Runtime> tauri::plugin::Plugin<R> for WindowPlugin {
    fn name(&self) -> &'static str {
        "window"
    }
    fn initialize(&mut self, app: &AppHandle<R>, _: Value) -> tauri::plugin::Result<()> {
        manager_global_shortcut(app)?;
        Ok(())
    }
    fn created(&mut self, window: tauri::Window<R>) {
        on_created(window);
    }
}
