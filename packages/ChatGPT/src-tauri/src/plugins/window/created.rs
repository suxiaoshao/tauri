/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 10:32:36
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/plugins/window/created.rs
 */
use tauri::Runtime;
#[cfg(target_os = "macos")]
use window_vibrancy::NSVisualEffectState;
#[cfg(target_os = "windows")]
use window_vibrancy::apply_mica;
#[cfg(target_os = "macos")]
use window_vibrancy::{NSVisualEffectMaterial, apply_vibrancy};

use crate::errors::ChatGPTResult;

pub fn on_created<R: Runtime>(window: tauri::Window<R>) -> ChatGPTResult<()> {
    window_beatify(&window)?;
    Ok(())
}

fn window_beatify<R: Runtime>(window: &tauri::Window<R>) -> ChatGPTResult<()> {
    window.set_decorations(true)?;
    // 修改边框
    window.set_shadow(true)?;
    // 修改背景
    #[cfg(target_os = "macos")]
    apply_vibrancy(
        window,
        NSVisualEffectMaterial::UnderWindowBackground,
        Some(NSVisualEffectState::Active),
        None,
    )?;
    #[cfg(target_os = "windows")]
    {
        apply_mica(window, None)?;
    }
    Ok(())
}

#[cfg(target_os = "macos")]
use tauri::WebviewWindow;

#[cfg(target_os = "macos")]
pub trait WindowExt {
    #[cfg(target_os = "macos")]
    fn set_transparent_titlebar(&self) -> ChatGPTResult<()>;
}

#[cfg(target_os = "macos")]
impl<R: Runtime> WindowExt for WebviewWindow<R> {
    #[cfg(target_os = "macos")]
    fn set_transparent_titlebar(&self) -> ChatGPTResult<()> {
        unsafe {
            use objc2_app_kit::NSWindowStyleMask;

            let id = (self.ns_window()? as *mut objc2_app_kit::NSWindow)
                .as_ref()
                .unwrap();
            let mut style_mask = id.styleMask();
            style_mask.remove(
                NSWindowStyleMask::Closable
                    | NSWindowStyleMask::Miniaturizable
                    | NSWindowStyleMask::Resizable,
            );
            id.setStyleMask(style_mask);
        }
        Ok(())
    }
}

#[allow(dead_code)]
pub enum ToolbarThickness {
    Thick,
    Medium,
    Thin,
}
