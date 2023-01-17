use tauri::{AppHandle, GlobalShortcutManager, Manager, Runtime};

use crate::error::ClipResult;

pub fn manager_global_shortcut<R: Runtime>(app: &AppHandle<R>) -> tauri::plugin::Result<()> {
    let mut manager = app.global_shortcut_manager();
    let app = app.clone();
    // 全局快捷键
    manager
        .register(
            if cfg!(target_os = "macos") {
                "Command+Y"
            } else {
                "Ctrl+Y"
            },
            move || {
                on_short(&app);
            },
        )
        .map_err(tauri::Error::Runtime)?;
    Ok(())
}

fn on_short<R: Runtime>(app: &AppHandle<R>) -> ClipResult<()> {
    if let Some(window) = app.get_window("clip") {
        window.close()?;
    } else {
        let windows =
            tauri::WindowBuilder::new(app, "clip", tauri::WindowUrl::App("index.html".into()))
                .center()
                .inner_size(800f64, 600f64)
                .skip_taskbar(true)
                .transparent(true)
                .always_on_top(true)
                .build()?;
        windows.set_focus()?;
    };
    Ok(())
}
