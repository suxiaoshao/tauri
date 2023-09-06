#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
use error::ClipResult;
use log::LevelFilter;
use tauri_plugin_log::LogTarget;
mod clipboard;
mod error;
mod plugin;
mod store;

fn main() -> ClipResult<()> {
    let app = tauri::Builder::default();
    #[cfg(target_os = "macos")]
    let app = app.setup(|app| {
        app.set_activation_policy(tauri::ActivationPolicy::Accessory);
        Ok(())
    });
    app.plugin(plugin::clipboard::ClipboardPlugin)
        .plugin(plugin::window::WindowPlugin)
        .plugin(tauri_plugin_positioner::init())
        .plugin(plugin::tracing::TracingPlugin)
        .plugin(
            tauri_plugin_log::Builder::default()
                .level(LevelFilter::Info)
                .targets([LogTarget::LogDir, LogTarget::Stdout, LogTarget::Webview])
                .build(),
        )
        .run(tauri::generate_context!())?;
    Ok(())
}
