#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod app_search;
mod errors;
mod plugin;

use app_search::AppPath;
use log::LevelFilter;
use tauri_plugin_global_shortcut::ShortcutState;
use tauri_plugin_log::{Target, TargetKind};

fn main() -> anyhow::Result<()> {
    let context = tauri::generate_context!();
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
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
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_shortcut("Alt+Space")?
                .with_handler(|app, _shortcut, event| {
                    if event.state == ShortcutState::Pressed
                        && let Err(err) = plugin::window::on_short(app)
                    {
                        log::error!("global shortcut error:{err}");
                    }
                })
                .build(),
        )
        .plugin(tauri_plugin_notification::init())
        .plugin(plugin::window::WindowPlugin::default())
        .plugin(plugin::tray::TrayPlugin)
        .invoke_handler(tauri::generate_handler![app_search])
        .setup(setup)
        .run(context)?;
    Ok(())
}

fn setup(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    app.set_activation_policy(tauri::ActivationPolicy::Accessory);
    Ok(())
}

#[tauri::command]
async fn app_search(path: String) -> Vec<AppPath> {
    app_search::query_app_data(&path)
}
