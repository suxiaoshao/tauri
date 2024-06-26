/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 10:32:15
 * @FilePath: /tauri/packages/Hclipboard/src-tauri/src/plugin/window/shortcut.rs
 */
use log::warn;
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
                if let Err(err) = on_short(&app) {
                    warn!("global shortcut error:{}", err)
                };
            },
        )
        .map_err(tauri::Error::Runtime)?;
    Ok(())
}

fn on_short<R: Runtime>(app: &AppHandle<R>) -> ClipResult<()> {
    if let Some(window) = app.get_window("main") {
        if window.is_visible()? {
            window.hide()?;
        } else {
            window.show()?;
            window.set_focus()?;
        }
    }
    Ok(())
}
