/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 10:32:05
 * @FilePath: /self-tools/Users/sushao/Documents/code/tauri/packages/Hclipboard/src-tauri/src/plugin/window/created.rs
 */
use tauri::Runtime;
#[cfg(target_os = "windows")]
use window_vibrancy::apply_mica;
#[cfg(target_os = "macos")]
use window_vibrancy::{NSVisualEffectMaterial, NSVisualEffectState, apply_vibrancy};

use crate::error::ClipResult;

pub fn on_created<R: Runtime>(window: tauri::Window<R>) -> ClipResult<()> {
    window_beatify(&window)?;
    Ok(())
}

fn window_beatify<R: Runtime>(window: &tauri::Window<R>) -> ClipResult<()> {
    window.set_shadow(true)?;
    // 修改背景
    #[cfg(target_os = "macos")]
    {
        apply_vibrancy(
            window,
            NSVisualEffectMaterial::HudWindow,
            Some(NSVisualEffectState::Active),
            None,
        )?;
    }
    #[cfg(target_os = "windows")]
    {
        window.set_decorations(false)?;
        apply_mica(
            window,
            window.theme().ok().map(|x| match x {
                tauri::Theme::Light => false,
                tauri::Theme::Dark => true,
                _ => false,
            }),
        )?;
    }
    // 标题栏
    #[cfg(target_os = "macos")]
    {
        unsafe {
            use objc2_app_kit::NSWindowStyleMask;

            let id = (window.ns_window()? as *mut objc2_app_kit::NSWindow)
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
    }
    Ok(())
}
