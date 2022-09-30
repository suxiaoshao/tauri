#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod clipboard;
mod store;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    use tauri::api::path::*;
    tauri::Builder::default()
        .setup(|x| {
            //data path
            let data_path = app_dir(&x.config())
                .unwrap()
                .join("clipboard.sqlite3")
                .to_str()
                .unwrap()
                .to_string();
            // clip
            let data = x.clipboard_manager();
            std::thread::spawn(|| {
                clipboard::Clipboard::init(data, data_path);
            });

            dbg!(app_dir(&x.config()));
            dbg!(log_dir(&x.config()));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
