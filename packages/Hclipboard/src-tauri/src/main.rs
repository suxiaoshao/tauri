#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use error::ClipResult;
use tauri::{App, Manager};

use crate::error::ClipError;

mod clipboard;
mod error;
mod store;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() -> ClipResult<()> {
    tauri::Builder::default()
        .setup(|x| {
            setup(x)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())?;
    Ok(())
}

fn setup(app: &mut App) -> ClipResult<()> {
    use tauri::api::path::*;
    //data path
    let data_path = app_dir(&app.config())
        .ok_or(ClipError::DbPath)?
        .join("clipboard.sqlite3")
        .to_str()
        .ok_or(ClipError::DbPath)?
        .to_string();
    // database connection
    let conn = store::establish_connection(&data_path)?;
    // clip
    let data = app.clipboard_manager();
    let inner_conn = conn.get()?;
    std::thread::spawn(|| {
        clipboard::Clipboard::init(data, inner_conn);
    });
    app.manage(conn);
    Ok(())
}
