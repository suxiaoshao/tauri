use tauri::Runtime;
use window_shadows::set_shadow;
#[cfg(target_os = "windows")]
use window_vibrancy::apply_mica;
#[cfg(target_os = "macos")]
use window_vibrancy::NSVisualEffectState;
#[cfg(target_os = "macos")]
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

use crate::errors::ChatGPTResult;

pub fn on_created<R: Runtime>(window: tauri::Window<R>) -> ChatGPTResult<()> {
    window_beatify(&window)?;
    #[cfg(debug_assertions)]
    {
        window.open_devtools()
    }
    Ok(())
}

fn window_beatify<R: Runtime>(window: &tauri::Window<R>) -> ChatGPTResult<()> {
    window.set_decorations(true)?;
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
        apply_mica(window, None)?;
    }
    Ok(())
}

use tauri::Window;

pub trait WindowExt {
    #[cfg(target_os = "macos")]
    fn set_transparent_titlebar(&self, thickness: ToolbarThickness);
}

impl<R: Runtime> WindowExt for Window<R> {
    #[cfg(target_os = "macos")]
    fn set_transparent_titlebar(&self, thickness: ToolbarThickness) {
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

    let new_toolbar = NSToolbar::alloc(id);
    new_toolbar.init_();
    id.setToolbar_(new_toolbar);
}
