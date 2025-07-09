/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-05-02 10:09:55
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-09-25 02:21:13
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/plugins/temporary_conversation/mod.rs
 */
use history::TemporaryStore;
use serde_json::Value;
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Manager, Runtime, WebviewWindow, WebviewWindowBuilder, WindowEvent};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut};

use crate::errors::ChatGPTResult;

use super::ChatGPTConfig;
mod delay;
mod history;
mod listen;

pub use {history::*, listen::TemporaryHotkeyListener};

#[derive(Default)]
pub struct TemporaryConversationPlugin {
    delayed_task: delay::DelayedTask,
}

impl TemporaryConversationPlugin {
    const DURATION: tokio::time::Duration = tokio::time::Duration::from_secs(10 * 60);
    fn on_blur(&mut self, app: &AppHandle<impl Runtime>) {
        let window = match app.get_webview_window(TEMPORARY_WINDOW) {
            Some(window) => window,
            None => return,
        };
        if let Err(err) = window.hide() {
            log::error!("hide temporary window error:{err}");
        }
        self.delayed_task.update(Self::DURATION, {
            async move {
                if let Err(err) = window.close() {
                    log::error!("close temporary window error:{err}");
                };
            }
        });
    }
    fn on_focus(&mut self) {
        self.delayed_task.cancel();
    }
}

const TEMPORARY_WINDOW: &str = "temporary_conversation_window";

impl<R: Runtime> tauri::plugin::Plugin<R> for TemporaryConversationPlugin {
    fn name(&self) -> &'static str {
        "temporary-conversation"
    }
    fn initialize(
        &mut self,
        app: &AppHandle<R>,
        _: Value,
    ) -> Result<(), Box<dyn std::error::Error>> {
        app.manage(Arc::new(Mutex::new(TemporaryStore::default())));
        manager_global_shortcut(app)?;
        Ok(())
    }
    fn on_event(&mut self, app: &AppHandle<R>, event: &tauri::RunEvent) {
        match event {
            tauri::RunEvent::WindowEvent {
                label,
                event: WindowEvent::Focused(focus),
                ..
            } if label == TEMPORARY_WINDOW => {
                if *focus {
                    self.on_focus();
                } else {
                    self.on_blur(app);
                }
            }
            _ => {}
        }
    }
    fn extend_api(&mut self, invoke: tauri::ipc::Invoke<R>) -> bool {
        let handle: Box<dyn Fn(tauri::ipc::Invoke<R>) -> bool + Send + Sync> =
            Box::new(tauri::generate_handler![
                history::init_temporary_conversation,
                history::temporary_fetch,
                history::delete_temporary_message,
                history::separate_window,
                history::get_temporary_conversation,
                history::delete_temporary_conversation,
                history::clear_temporary_conversation,
                history::save_temporary_conversation,
                history::get_temporary_message,
                history::update_temporary_message
            ]);
        (handle)(invoke)
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
    let manager = app.global_shortcut();
    // 全局快捷键
    manager.register(temporary_hotkey.as_str())?;
    Ok(())
}

pub fn on_shortcut_trigger<R: Runtime>(
    app: &AppHandle<R>,
    shortcut: &Shortcut,
) -> ChatGPTResult<()> {
    // get api key
    let config = ChatGPTConfig::get(app)?;
    let temporary_hotkey = match config
        .temporary_hotkey
        .and_then::<Shortcut, _>(|data| data.try_into().ok())
    {
        Some(data) => data,
        None => return Ok(()),
    };
    if shortcut == &temporary_hotkey {
        let app = app.app_handle().clone();
        if cfg!(target_os = "windows") {
            tauri::async_runtime::spawn(async move {
                if let Err(err) = trigger_temp_window(&app) {
                    log::error!("trigger temporary window error:{err}");
                };
            });
        } else if let Err(err) = trigger_temp_window(&app) {
            log::error!("trigger temporary window error:{err}");
        }
    }
    Ok(())
}

pub fn trigger_temp_window<R: Runtime>(app: &AppHandle<R>) -> ChatGPTResult<()> {
    match app.get_webview_window(TEMPORARY_WINDOW) {
        Some(window) => {
            if window.is_visible()? {
                window.hide()?;
            } else {
                window.show()?;
                window.set_focus()?;
            }
        }
        None => {
            create_temporary_window(app)?;
        }
    }
    Ok(())
}

pub fn create_temporary_window<R: Runtime>(app: &AppHandle<R>) -> ChatGPTResult<WebviewWindow<R>> {
    let window = WebviewWindowBuilder::new(
        app,
        TEMPORARY_WINDOW,
        tauri::WebviewUrl::App("/temporary_conversation".into()),
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
    window.hide_menu()?;
    Ok(window)
}
