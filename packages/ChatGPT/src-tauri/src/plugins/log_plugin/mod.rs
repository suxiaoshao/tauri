use log::info;
use tauri::{AppHandle, RunEvent, Runtime};

pub struct LogPlugin;

impl<R: Runtime> tauri::plugin::Plugin<R> for LogPlugin {
    fn name(&self) -> &'static str {
        "tracing"
    }
    fn on_event(&mut self, _app: &AppHandle<R>, event: &tauri::RunEvent) {
        match event {
            RunEvent::Exit => info!("exit"),
            RunEvent::ExitRequested { api, .. } => api.prevent_exit(),
            RunEvent::Ready => info!("ready"),
            RunEvent::Resumed => info!("resumed"),
            _ => {}
        }
    }
}
