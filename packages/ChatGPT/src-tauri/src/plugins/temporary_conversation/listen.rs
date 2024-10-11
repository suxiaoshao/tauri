use tauri::Runtime;
use tauri_plugin_global_shortcut::GlobalShortcutExt;

use crate::{
    errors::{ChatGPTError, ChatGPTResult},
    plugins::{ChatGPTConfig, Listenable},
};

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
            let manager = app_handle.global_shortcut();
            manager.unregister(old_temporary.as_str()).map_err(|err| {
                log::warn!("unregister global shortcut error:{}", err);
                ChatGPTError::GlobalShortcuts(err)
            })?;
        }
        if let Some(new_temporary) = &new_value.temporary_hotkey {
            let manager = app_handle.global_shortcut();
            manager.register(new_temporary.as_str()).map_err(|err| {
                log::warn!("register global shortcut error:{}", err);
                ChatGPTError::GlobalShortcuts(err)
            })?;
        }
        Ok(())
    }
}
