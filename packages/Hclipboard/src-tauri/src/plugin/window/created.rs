/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 10:32:05
 * @FilePath: /self-tools/Users/sushao/Documents/code/tauri/packages/Hclipboard/src-tauri/src/plugin/window/created.rs
 */
use tauri::Runtime;
use window_shadows::set_shadow;
#[cfg(target_os = "windows")]
use window_vibrancy::apply_mica;
#[cfg(target_os = "macos")]
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial, NSVisualEffectState};

use crate::error::ClipResult;

pub fn on_created<R: Runtime>(window: tauri::Window<R>) -> ClipResult<()> {
    window_beatify(&window)?;
    Ok(())
}

fn window_beatify<R: Runtime>(window: &tauri::Window<R>) -> ClipResult<()> {
    // 修改边框
    set_shadow(window, true)?;
    // 修改背景
    #[cfg(target_os = "macos")]
    apply_vibrancy(
        window,
        NSVisualEffectMaterial::HudWindow,
        Some(NSVisualEffectState::Active),
        None,
    )?;
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
        use cocoa::appkit::{NSWindow, NSWindowStyleMask, NSWindowTitleVisibility};
        unsafe {
            let id = window.ns_window()? as cocoa::base::id;
            NSWindow::setTitlebarAppearsTransparent_(id, cocoa::base::YES);
            let mut style_mask = id.styleMask();
            style_mask.set(NSWindowStyleMask::NSFullSizeContentViewWindowMask, true);
            style_mask.remove(
                NSWindowStyleMask::NSClosableWindowMask
                    | NSWindowStyleMask::NSMiniaturizableWindowMask
                    | NSWindowStyleMask::NSResizableWindowMask,
            );
            id.setStyleMask_(style_mask);
            id.setTitleVisibility_(NSWindowTitleVisibility::NSWindowTitleHidden);
            id.setTitlebarAppearsTransparent_(cocoa::base::YES);
        }
    }
    Ok(())
}
