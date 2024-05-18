use tauri::{GlobalShortcutManager, Runtime};

use crate::{
    errors::ChatGPTResult,
    plugins::{ChatGPTConfig, Listenable},
};

use super::on_short;

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
