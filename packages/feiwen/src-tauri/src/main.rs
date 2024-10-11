#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use errors::FeiwenResult;
use log::LevelFilter;
use plugins::{LogPlugin, WindowPlugin};
use tauri::{App, WebviewWindowBuilder};
use tauri_plugin_log::{Target, TargetKind};
mod errors;
pub mod fetch;
pub mod plugins;
mod query;
mod store;

fn main() -> FeiwenResult<()> {
    tauri::Builder::default()
        .setup(|app| {
            setup(app)?;
            Ok(())
        })
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
        .plugin(LogPlugin)
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(plugins::StorePlugin)
        .plugin(WindowPlugin)
        .run(tauri::generate_context!())?;
    Ok(())
}

fn setup(app: &mut App) -> FeiwenResult<()> {
    let window = WebviewWindowBuilder::new(app, "main", tauri::WebviewUrl::App("/".into()))
        .title("废文")
        .inner_size(800.0, 600.0)
        .fullscreen(false)
        .resizable(true)
        .transparent(true);
    // #[cfg(target_os = "macos")]
    // let window = window
    //     .title_bar_style(tauri::TitleBarStyle::Overlay)
    //     .hidden_title(true);
    #[cfg(target_os = "windows")]
    let window = window.decorations(false);
    window.build()?;
    Ok(())
}
