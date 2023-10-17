#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use errors::FeiwenResult;
use log::LevelFilter;
use plugins::{LogPlugin, WindowPlugin};
use tauri::{App, WindowBuilder};
use tauri_plugin_log::LogTarget;

#[macro_use]
extern crate diesel;
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
        .plugin(
            tauri_plugin_log::Builder::default()
                .level(LevelFilter::Info)
                .targets([LogTarget::LogDir, LogTarget::Stdout, LogTarget::Webview])
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
    let window = WindowBuilder::new(app, "main", tauri::WindowUrl::App("/".into()))
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
