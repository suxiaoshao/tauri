#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use error::ClipResult;
use tauri::RunEvent;

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
    app.run(|app_handle, e| match e {
        RunEvent::Exit => println!("Exiting..."),
        RunEvent::ExitRequested { api, .. } => println!("Exit requested..."),
        RunEvent::WindowEvent { label, event, .. } => {
            println!("Window event: {} - {:?}", label, event)
        }
        RunEvent::Ready => println!("Ready!"),
        RunEvent::Resumed => println!("Resumed!"),
        RunEvent::MainEventsCleared => println!("Main events cleared!"),
        _ => println!("Other event: {:?}", e),
    });
    Ok(())
}
