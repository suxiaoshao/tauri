use self::created::on_created;
use log::warn;
use serde_json::Value;
pub use shortcut::on_short;
#[cfg(target_os = "macos")]
pub use shortcut::{FrontmostApp, restore_frontmost_app};
use tauri::{AppHandle, Manager, Runtime, WindowEvent};

mod created;
mod shortcut;

const WINDOW_NAME: &str = "main";

#[derive(Default)]
pub struct WindowPlugin {
    delayed_task: delay::DelayedTask,
}

impl WindowPlugin {
    const DURATION: tokio::time::Duration = tokio::time::Duration::from_secs(10 * 60);
    fn on_blur(&mut self, app: &AppHandle<impl Runtime>) {
        let window = match app.get_webview_window(WINDOW_NAME) {
            Some(window) => window,
            None => return,
        };
        if let Err(err) = window.hide() {
            log::error!("hide temporary window error:{err}");
        }
        self.delayed_task.update(Self::DURATION, {
            async move {
                if let Err(err) = window.close() {
                    log::error!("close temporary window error:{err}");
                };
            }
        });
    }
    fn on_focus(&mut self) {
        self.delayed_task.cancel();
    }
}

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
            tauri::RunEvent::WindowEvent {
                label,
                event: WindowEvent::Focused(focus),
                ..
            } if label == WINDOW_NAME => {
                if *focus {
                    self.on_focus();
                } else {
                    self.on_blur(app);
                }
            }
            _ => {}
        }
    }
}
