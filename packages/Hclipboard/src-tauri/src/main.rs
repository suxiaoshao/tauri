#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
use error::ClipResult;
use log::LevelFilter;
use plugin::window::on_short;
use tauri_plugin_global_shortcut::ShortcutState;
use tauri_plugin_log::{Target, TargetKind};
mod clipboard;
mod error;
mod plugin;
mod store;

fn main() -> ClipResult<()> {
    let app = tauri::Builder::default();
    #[cfg(target_os = "macos")]
    let app = app.setup(|app| {
        app.set_activation_policy(tauri::ActivationPolicy::Accessory);
        Ok(())
    });
    app.plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(
            tauri_plugin_log::Builder::default()
                .level(LevelFilter::Info)
                .targets([
                    Target::new(TargetKind::Stdout),
                    Target::new(TargetKind::LogDir { file_name: None }),
                    Target::new(TargetKind::Webview),
                ])
                .build(),
        )
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_shortcut(if cfg!(target_os = "macos") {
                    "Command+Y"
                } else {
                    "Ctrl+Y"
                })?
                .with_handler(|app, _shortcut, event| {
                    if event.state == ShortcutState::Pressed {
                        if let Err(err) = on_short(app) {
                            log::error!("global shortcut error:{}", err);
                        };
                    }
                })
                .build(),
        )
        .plugin(plugin::clipboard::ClipboardPlugin)
        .plugin(plugin::window::WindowPlugin)
        .plugin(plugin::tracing::TracingPlugin)
        .run(tauri::generate_context!())?;
    Ok(())
}
