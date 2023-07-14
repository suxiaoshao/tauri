// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use errors::ChatGPTResult;
use log::LevelFilter;
use plugins::LogPlugin;
use tauri_plugin_log::LogTarget;

mod errors;
mod fetch;
mod plugins;

fn main() -> ChatGPTResult<()> {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::default()
                .level(LevelFilter::Info)
                .targets([LogTarget::LogDir, LogTarget::Stdout, LogTarget::Webview])
                .build(),
        )
        .plugin(LogPlugin)
        .plugin(plugins::WindowPlugin)
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(plugins::ConfigPlugin)
        .plugin(plugins::ChatPlugin)
        .run(tauri::generate_context!())?;
    Ok(())
}
