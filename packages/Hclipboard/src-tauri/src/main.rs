#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use error::ClipResult;
use tauri::{Manager, RunEvent};

mod clipboard;
mod error;
mod plugin;
mod store;

fn main() -> ClipResult<()> {
    let app = tauri::Builder::default()
        .plugin(plugin::clipboard::init())
        .plugin(plugin::window::WindowPlugin)
        .plugin(tauri_plugin_positioner::init())
        .build(tauri::generate_context!())?;
    app.run(|app, e| match e {
        RunEvent::Exit => println!("Exiting..."),
        RunEvent::ExitRequested { api, .. } => api.prevent_exit(),
        RunEvent::Ready => println!("Ready!"),
        RunEvent::Resumed => println!("Resumed!"),
        RunEvent::WindowEvent {
            label,
            event: tauri::WindowEvent::Focused(false),
            ..
        } if label == "clip" => {
            app.get_window("clip").unwrap().close().unwrap();
        }
        _ => {}
    });
    Ok(())
}
