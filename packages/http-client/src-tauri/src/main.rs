#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod app_search;
use app_search::AppPath;
use tauri::{
    AppHandle, LogicalPosition, LogicalSize, Manager, Runtime,
    menu::{Menu, MenuItem},
    tray::MouseButton,
};
use tauri_plugin_global_shortcut::ShortcutState;

fn main() -> anyhow::Result<()> {
    let context = tauri::generate_context!();
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_shortcut("Alt+Space")?
                .with_handler(|app, _shortcut, event| {
                    if event.state == ShortcutState::Pressed {
                        on_short(app).unwrap();
                    }
                })
                .build(),
        )
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![app_search])
        .setup(setup)
        .run(context)?;
    Ok(())
}

fn setup(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let window = app.get_webview_window("main").unwrap();
    #[cfg(debug_assertions)]
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
    let w = app.get_webview_window("main").unwrap();
    window.on_window_event(move |event| {
        if let tauri::WindowEvent::Focused(false) = event {
            w.hide().unwrap();
        }
    });

    // 全局快捷键
    system_tray(app.handle())?;

    Ok(())
}

fn on_short<R: Runtime>(app: &AppHandle<R>) -> anyhow::Result<()> {
    let window = app.get_webview_window("main").unwrap();
    if window.is_visible()? {
        window.hide()?;
    } else {
        window.show()?;
        window.set_focus()?;
        app_search::app_data_init(app);
    }
    Ok(())
}

fn system_tray<R: Runtime>(app: &tauri::AppHandle<R>) -> Result<(), Box<dyn std::error::Error>> {
    let tray = match app.tray_by_id("main") {
        Some(tray) => tray,
        None => return Ok(()),
    };
    let tray_menu = Menu::with_items(
        app,
        &[
            &MenuItem::with_id(app, "hide", "隐藏", true, None::<&str>)?,
            &MenuItem::with_id(app, "close", "关闭", true, None::<&str>)?,
        ],
    )?;
    tray.set_menu(Some(tray_menu))?;
    tray.set_show_menu_on_left_click(true)?;
    tray.on_menu_event(|app, event| match event.id().as_ref() {
        "hide" => {
            let window = app.get_webview_window("main").unwrap();
            if window.is_visible().unwrap() {
                window.hide().unwrap();
            }
        }
        "close" => {
            let window = app.get_webview_window("main").unwrap();
            window.close().unwrap();
        }
        _ => {}
    });
    tray.on_tray_icon_event(|app, event| {
        if let tauri::tray::TrayIconEvent::Click {
            button: MouseButton::Left,
            ..
        } = event
        {
            let window = app.app_handle().get_webview_window("main").unwrap();
            if window.is_visible().unwrap() {
                window.hide().unwrap();
            } else {
                window.show().unwrap();
                window.set_focus().unwrap();
                app_search::app_data_init(app.app_handle());
            }
        }
    });

    Ok(())
}

#[tauri::command]
async fn app_search(path: String) -> Vec<AppPath> {
    app_search::query_app_data(&path)
}
