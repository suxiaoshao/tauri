#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use errors::FeiwenResult;
use log::LevelFilter;
use plugins::LogPlugin;
use tauri::Manager;
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
            #[cfg(debug_assertions)]
            {
                let win = app.get_window("main").unwrap();
                win.open_devtools();
            }
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
        .run(tauri::generate_context!())?;
    Ok(())
}
