/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-05-02 10:09:55
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-19 03:42:01
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/plugins/temporary_conversation/mod.rs
 */
use serde_json::Value;
use tauri::{
    AppHandle, GlobalShortcutManager, Invoke, Manager, Runtime, WindowBuilder, WindowEvent,
};

use crate::errors::ChatGPTResult;

use super::ChatGPTConfig;
mod delay;
mod history;
mod listen;

pub use listen::TemporaryHotkeyListener;

#[derive(Default)]
pub struct TemporaryConversationPlugin {
    delayed_task: delay::DelayedTask,
}

impl TemporaryConversationPlugin {
    const DURATION: tokio::time::Duration = tokio::time::Duration::from_secs(10 * 60);
    fn on_blur(&mut self, app: &AppHandle<impl Runtime>) {
        let window = match app.get_window(TEMPORARY_WINDOW) {
            Some(window) => window,
            None => return,
        };
        if let Err(err) = window.hide() {
            log::error!("hide temporary window error:{}", err);
        };
        self.delayed_task.update(Self::DURATION, {
            async move {
                if let Err(err) = window.close() {
                    log::error!("close temporary window error:{}", err);
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
        "temporary_conversation"
    }
    fn initialize(&mut self, app: &AppHandle<R>, _: Value) -> tauri::plugin::Result<()> {
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
    fn extend_api(&mut self, invoke: Invoke<R>) {
        let handle: Box<dyn Fn(Invoke<R>) + Send + Sync> = Box::new(tauri::generate_handler![
            history::init_temporary_conversation,
            history::temporary_fetch,
            history::find_temporary_message,
            history::delete_temporary_message,
        ]);
        (handle)(invoke);
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
                window.hide()?;
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
    #[cfg(target_os = "windows")]
    window.set_decorations(false)?;
    #[cfg(target_os = "macos")]
    {
        use super::window::WindowExt;
        window.set_transparent_titlebar()?;
    }
    Ok(())
}
