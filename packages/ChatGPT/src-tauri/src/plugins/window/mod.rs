use log::warn;
use tauri::Runtime;

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
}
