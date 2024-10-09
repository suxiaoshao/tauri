/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 10:32:15
 * @FilePath: /tauri/packages/Hclipboard/src-tauri/src/plugin/window/shortcut.rs
 */
use tauri::{AppHandle, Manager, Runtime};
use tauri_plugin_global_shortcut::GlobalShortcutExt;

use crate::error::ClipResult;

pub fn manager_global_shortcut<R: Runtime>(
    app: &AppHandle<R>,
) -> Result<(), Box<dyn std::error::Error>> {
    let manager = app.global_shortcut();
    // 全局快捷键
    manager.register(if cfg!(target_os = "macos") {
        "Command+Y"
    } else {
        "Ctrl+Y"
    })?;
    Ok(())
}

fn on_short<R: Runtime>(app: &AppHandle<R>) -> ClipResult<()> {
    if let Some(window) = app.get_webview_window("main") {
        if window.is_visible()? {
            window.hide()?;
        } else {
            window.show()?;
            window.set_focus()?;
        }
    }
    Ok(())
}
