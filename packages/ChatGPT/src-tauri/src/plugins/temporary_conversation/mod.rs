/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-05-02 10:09:55
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-09 20:19:17
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/plugins/temporary_conversation/mod.rs
 */
use serde_json::Value;
use tauri::{AppHandle, GlobalShortcutManager, Manager, Runtime, WindowBuilder};

use crate::errors::ChatGPTResult;

use super::{ChatGPTConfig, Listenable};

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
pub fn manager_global_shortcut<R: Runtime>(app: &AppHandle<R>) -> ChatGPTResult<()> {
    let ChatGPTConfig {
        temporary_hotkey, ..
    } = ChatGPTConfig::get(app)?;
    let temporary_hotkey = match temporary_hotkey {
        Some(data) => data,
        None => return Ok(()),
    };
    let mut manager = app.global_shortcut_manager();
    let app = app.clone();
    // 全局快捷键
    manager
        .register(&temporary_hotkey, move || {
            if let Err(err) = on_short(&app) {
                log::warn!("global shortcut error:{}", err)
            };
        })
        .map_err(tauri::Error::Runtime)?;
    Ok(())
}

pub fn on_short<R: Runtime>(app: &AppHandle<R>) -> ChatGPTResult<()> {
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

#[derive(Clone, Copy)]
pub struct TemporaryHotkeyListener;

impl Listenable for TemporaryHotkeyListener {
    fn listen<R: Runtime>(
        &self,
        old_value: &ChatGPTConfig,
        new_value: &ChatGPTConfig,
        app_handle: &tauri::AppHandle<R>,
    ) -> ChatGPTResult<()> {
        if old_value.temporary_hotkey == new_value.temporary_hotkey {
            return Ok(());
        }
        if let Some(old_temporary) = &old_value.temporary_hotkey {
            let mut manager = app_handle.global_shortcut_manager();
            manager.unregister(old_temporary).map_err(|err| {
                log::warn!("unregister global shortcut error:{}", err);
                tauri::Error::Runtime(err)
            })?;
        }
        if let Some(new_temporary) = &new_value.temporary_hotkey {
            let mut manager = app_handle.global_shortcut_manager();
            let app = app_handle.clone();
            manager
                .register(new_temporary, move || {
                    if let Err(err) = on_short(&app) {
                        log::warn!("global shortcut error:{}", err)
                    };
                })
                .map_err(|err| {
                    log::warn!("register global shortcut error:{}", err);
                    tauri::Error::Runtime(err)
                })?;
        }
        Ok(())
    }
}
