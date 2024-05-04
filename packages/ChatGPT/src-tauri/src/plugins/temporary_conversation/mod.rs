/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-05-02 10:09:55
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-04 05:56:52
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/plugins/temporary_conversation/mod.rs
 */
use serde_json::Value;
use tauri::{AppHandle, GlobalShortcutManager, Manager, Runtime, WindowBuilder};

use crate::errors::ChatGPTResult;

pub struct TemporaryConversationPlugin;

const TEMPORARY_WINDOW: &str = "temporary_conversation_window";

impl<R: Runtime> tauri::plugin::Plugin<R> for TemporaryConversationPlugin {
    fn name(&self) -> &'static str {
        "temporary_conversation"
    }
    fn initialize(&mut self, app: &AppHandle<R>, _: Value) -> tauri::plugin::Result<()> {
        manager_global_shortcut(app)?;
        Ok(())
    }
}
pub fn manager_global_shortcut<R: Runtime>(app: &AppHandle<R>) -> tauri::plugin::Result<()> {
    let mut manager = app.global_shortcut_manager();
    let app = app.clone();
    // 全局快捷键
    manager
        .register(
            if cfg!(target_os = "macos") {
                "Option+F"
            } else {
                "Alt+F"
            },
            move || {
                if let Err(err) = on_short(&app) {
                    log::warn!("global shortcut error:{}", err)
                };
            },
        )
        .map_err(tauri::Error::Runtime)?;
    Ok(())
}

fn on_short<R: Runtime>(app: &AppHandle<R>) -> ChatGPTResult<()> {
    match app.get_window(TEMPORARY_WINDOW) {
        Some(window) => {
            if window.is_visible()? {
                window.close()?;
            } else {
                window.show()?;
                window.set_focus()?;
            }
        }
        None => {
            create_window(app)?;
        }
    }
    Ok(())
}

fn create_window<R: Runtime>(app: &AppHandle<R>) -> ChatGPTResult<()> {
    let window = WindowBuilder::new(
        app,
        TEMPORARY_WINDOW,
        tauri::WindowUrl::App("/temporary_conversation".into()),
    )
    .title("Temporary Conversation")
    .inner_size(800.0, 600.0)
    .fullscreen(false)
    .resizable(false)
    .transparent(true)
    .always_on_top(true)
    .skip_taskbar(true)
    .center();
    #[cfg(target_os = "macos")]
    let window = window
        .title_bar_style(tauri::TitleBarStyle::Overlay)
        .hidden_title(true);
    #[cfg(target_os = "windows")]
    let window = window.decorations(false);
    let window = window.build()?;
    #[cfg(target_os = "macos")]
    {
        use super::window::WindowExt;
        window.set_transparent_titlebar()?;
    }
    Ok(())
}
