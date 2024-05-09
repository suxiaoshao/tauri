// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use errors::ChatGPTResult;
use log::LevelFilter;
use plugins::{LogPlugin, MainConfigListener, TemporaryHotkeyListener};
use tauri::{App, WindowBuilder};
use tauri_plugin_log::LogTarget;

mod errors;
mod fetch;
mod plugins;
mod store;

fn main() -> ChatGPTResult<()> {
    tauri::Builder::default()
        .setup(|app| {
            setup(app)?;
            Ok(())
        })
        .plugin(
            tauri_plugin_log::Builder::default()
                .level(LevelFilter::Info)
                .targets([LogTarget::LogDir, LogTarget::Stdout, LogTarget::Webview])
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
        .plugin(plugins::TemporaryConversationPlugin)
        .plugin(plugins::TrayPlugin)
        .run(tauri::generate_context!())?;
    Ok(())
}

fn setup(app: &mut App) -> ChatGPTResult<()> {
    let window = WindowBuilder::new(app, "main", tauri::WindowUrl::App("/".into()))
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
    window.build()?;
    Ok(())
}
