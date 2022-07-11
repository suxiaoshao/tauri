#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod app_search;
use app_search::AppPath;
use std::{collections::HashMap, path::PathBuf};
use tauri::{
    AppHandle, CustomMenuItem, GlobalShortcutManager, Manager, Menu, SystemTray, SystemTrayEvent,
    SystemTrayMenu,
};

fn main() -> anyhow::Result<()> {
    let context = tauri::generate_context!();
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![app_search])
        .menu(menu(&context.package_info().name))
        .system_tray(system_tray())
        .on_system_tray_event(on_system_tray_event)
        .setup(setup)
        .run(context)?;
    Ok(())
}

fn menu(name: &str) -> Menu {
    if cfg!(target_os = "macos") {
        Menu::os_default(name)
    } else {
        Menu::default()
    }
}

fn setup(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let mut manager = app.global_shortcut_manager();

    let window = app.get_window("main").unwrap();
    let w = app.get_window("main").unwrap();

    window.on_window_event(move |event| {
        if let tauri::WindowEvent::Focused(false) = event {
            w.hide().unwrap();
        }
    });

    manager.register("Alt+Space", move || {
        if window.is_visible().unwrap() {
            window.hide().unwrap();
        } else {
            window.show().unwrap();
            window.set_focus().unwrap();
        }
    })?;
    Ok(())
}

fn system_tray() -> SystemTray {
    let quit = CustomMenuItem::new("hide".to_string(), "隐藏");
    let hide = CustomMenuItem::new("close".to_string(), "关闭");
    let tray_menu = SystemTrayMenu::new().add_item(quit).add_item(hide);

    SystemTray::new().with_menu(tray_menu)
}
fn on_system_tray_event(app: &AppHandle, event: SystemTrayEvent) {
    let window = app.get_window("main").unwrap();
    match event {
        SystemTrayEvent::LeftClick { .. } => {
            if window.is_visible().unwrap() {
                window.hide().unwrap();
            } else {
                window.show().unwrap();
                window.set_focus().unwrap();
            }
        }

        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
            "close" => window.close().unwrap(),
            "hide" => window.hide().unwrap(),
            _ => {}
        },
        _ => {}
    }
}

#[tauri::command]
async fn app_search() -> Option<HashMap<PathBuf, AppPath>> {
    app_search::app_search()
}
