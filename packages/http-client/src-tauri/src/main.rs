#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod app_search;
use app_search::AppPath;
use tauri::{
    AppHandle, CustomMenuItem, GlobalShortcutManager, LogicalPosition, LogicalSize, Manager, Menu,
    SystemTray, SystemTrayEvent, SystemTrayMenu,
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
    window.open_devtools();

    // 修改窗口位置
    let scale_factor = window.scale_factor().unwrap();
    let monitor = window.current_monitor().unwrap().unwrap();
    let size = monitor.size();
    let LogicalSize { width, height } = size.to_logical::<f64>(scale_factor);
    let size = window.outer_size().unwrap();
    let LogicalSize { width: w_width, .. } = size.to_logical::<f64>(scale_factor);
    window
        .set_position(LogicalPosition {
            y: height / 5.0,
            x: width / 2.0 - w_width / 2.0,
        })
        .unwrap();

    // 设置消失
    let w = app.get_window("main").unwrap();
    window.on_window_event(move |event| {
        if let tauri::WindowEvent::Focused(false) = event {
            w.hide().unwrap();
        }
    });

    // 全局快捷键
    manager.register("Alt+Space", move || {
        if window.is_visible().unwrap() {
            window.hide().unwrap();
        } else {
            window.show().unwrap();
            window.set_focus().unwrap();
            app_search::app_data_init();
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
                app_search::app_data_init();
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
async fn app_search(path: String) -> Vec<AppPath> {
    app_search::query_app_data(&path)
}
