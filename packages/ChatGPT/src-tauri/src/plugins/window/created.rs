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
    #[allow(dead_code)]
    #[cfg(target_os = "macos")]
    fn set_titlebar_thick(&self, thickness: ToolbarThickness);
    #[cfg(target_os = "macos")]
    fn set_transparent_titlebar(&self) -> ChatGPTResult<()>;
}

#[cfg(target_os = "macos")]
impl<R: Runtime> WindowExt for WebviewWindow<R> {
    #[cfg(target_os = "macos")]
    fn set_titlebar_thick(&self, thickness: ToolbarThickness) {
        use cocoa::appkit::{NSWindow, NSWindowTitleVisibility};

        unsafe {
            let id = self.ns_window().unwrap() as cocoa::base::id;

            id.setTitlebarAppearsTransparent_(cocoa::base::YES);

            match thickness {
                ToolbarThickness::Thick => {
                    self.set_title("").expect("Title wasn't set to ''");
                    make_toolbar(id);
                }
                ToolbarThickness::Medium => {
                    id.setTitleVisibility_(NSWindowTitleVisibility::NSWindowTitleHidden);
                    make_toolbar(id);
                }
                ToolbarThickness::Thin => {
                    id.setTitleVisibility_(NSWindowTitleVisibility::NSWindowTitleHidden);
                }
            }
        }
    }
    #[cfg(target_os = "macos")]
    fn set_transparent_titlebar(&self) -> ChatGPTResult<()> {
        use cocoa::appkit::{NSWindow, NSWindowStyleMask};
        unsafe {
            let id = self.ns_window()? as cocoa::base::id;
            let mut style_mask = id.styleMask();
            style_mask.remove(
                NSWindowStyleMask::NSClosableWindowMask
                    | NSWindowStyleMask::NSMiniaturizableWindowMask
                    | NSWindowStyleMask::NSResizableWindowMask,
            );
            id.setStyleMask_(style_mask);
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

#[cfg(target_os = "macos")]
unsafe fn make_toolbar(id: cocoa::base::id) {
    use cocoa::appkit::{NSToolbar, NSWindow};

    unsafe {
        let new_toolbar = NSToolbar::alloc(id);
        new_toolbar.init_();
        id.setToolbar_(new_toolbar);
    }
}
