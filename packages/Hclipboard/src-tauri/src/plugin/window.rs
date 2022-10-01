use tauri::{GlobalShortcutManager, Manager, Runtime};
use tauri_plugin_positioner::{Position, WindowExt};

pub struct WindowPlugin;

impl<R: Runtime> tauri::plugin::Plugin<R> for WindowPlugin {
    fn name(&self) -> &'static str {
        "window"
    }
    fn created(&mut self, window: tauri::Window<R>) {
        let app = window.app_handle();
        let mut manager = app.global_shortcut_manager();
        if window.label() == "main" {}
        // 全局快捷键
        manager
            .register("Command+Y", move || {
                println!("Command+Y");
                if window.is_visible().unwrap() {
                    window.hide().unwrap();
                } else {
                    window.show().unwrap();
                    window.set_focus().unwrap();
                    window.move_window(Position::TopRight).unwrap();
                }
            })
            .map_err(tauri::Error::Runtime)
            .unwrap();
    }
}
