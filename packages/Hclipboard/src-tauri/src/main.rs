#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use error::ClipResult;

mod clipboard;
mod error;
mod plugin;
mod store;

fn main() -> ClipResult<()> {
    tauri::Builder::default()
        .plugin(plugin::clipboard::init())
        .plugin(plugin::window::WindowPlugin)
        .plugin(tauri_plugin_positioner::init())
        .run(tauri::generate_context!())?;
    Ok(())
}
