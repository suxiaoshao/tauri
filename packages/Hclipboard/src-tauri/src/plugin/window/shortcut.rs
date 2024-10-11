/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 10:32:15
 * @FilePath: /tauri/packages/Hclipboard/src-tauri/src/plugin/window/shortcut.rs
 */
use tauri::{AppHandle, Manager, Runtime};

use crate::error::ClipResult;

pub fn on_short<R: Runtime>(app: &AppHandle<R>) -> ClipResult<()> {
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
