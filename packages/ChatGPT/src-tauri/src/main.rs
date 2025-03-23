// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::path::PathBuf;

use errors::ChatGPTResult;
use log::LevelFilter;
use plugins::{LogPlugin, MainConfigListener, TemporaryHotkeyListener, on_shortcut_trigger};
use tauri::{Manager, Runtime, WebviewWindow};
use tauri_plugin_global_shortcut::ShortcutState;
use tauri_plugin_log::{Target, TargetKind};

mod adapter;
mod errors;
mod fetch;
mod plugins;
mod store;

fn main() -> ChatGPTResult<()> {
    tauri::Builder::default()
        .setup(|app| {
            create_main_window(app, "/")?;
            Ok(())
        })
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, shortcut, event| {
                    if event.state == ShortcutState::Pressed {
                        if let Err(err) = on_shortcut_trigger(app, shortcut) {
                            log::error!("global shortcut error:{}", err);
                        };
                    }
                })
                .build(),
        )
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
        .plugin(LogPlugin)
        .plugin(plugins::WindowPlugin)
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(
            plugins::ConfigPlugin::new()
                .add_listen(MainConfigListener)
                .add_listen(TemporaryHotkeyListener),
        )
        .plugin(plugins::ChatPlugin)
        .plugin(plugins::TemporaryConversationPlugin::default())
        .plugin(plugins::TrayPlugin)
        .plugin(plugins::AdapterPlugin)
        .run(tauri::generate_context!())?;
    Ok(())
}

fn create_main_window<R: Runtime, M: Manager<R>>(
    app: &M,
    path: impl Into<PathBuf>,
) -> ChatGPTResult<WebviewWindow<R>> {
    let window = WebviewWindow::builder(app, "main", tauri::WebviewUrl::App(path.into()))
        .title("ChatGPT")
        .inner_size(800.0, 600.0)
        .fullscreen(false)
        .resizable(true)
        .transparent(true);
    #[cfg(target_os = "macos")]
    let window = window
        .title_bar_style(tauri::TitleBarStyle::Overlay)
        .hidden_title(true);
    #[cfg(target_os = "windows")]
    let window = window.decorations(false);
    let window = window.build()?;
    Ok(window)
}
