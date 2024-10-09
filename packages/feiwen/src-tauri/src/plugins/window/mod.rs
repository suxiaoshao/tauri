use log::warn;
use tauri::{RunEvent, Runtime};

use self::created::on_created;

mod created;

pub struct WindowPlugin;

impl<R: Runtime> tauri::plugin::Plugin<R> for WindowPlugin {
    fn name(&self) -> &'static str {
        "window"
    }
    fn webview_created(&mut self, webview: tauri::Webview<R>) {
        #[cfg(debug_assertions)]
        {
            webview.open_devtools()
        }
    }
    fn window_created(&mut self, window: tauri::Window<R>) {
        if let Err(err) = on_created(window) {
            warn!("window created error:{}", err)
        };
    }
    fn on_event(&mut self, app: &tauri::AppHandle<R>, event: &tauri::RunEvent) {
        if let RunEvent::WindowEvent {
            label,
            event: tauri::WindowEvent::CloseRequested { .. },
            ..
        } = event
        {
            if label == "main" {
                app.exit(0);
            }
        }
    }
}
