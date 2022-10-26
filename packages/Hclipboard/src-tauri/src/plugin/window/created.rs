use tauri::{Runtime, WindowEvent};
use window_shadows::set_shadow;
#[cfg(target_os = "windows")]
use window_vibrancy::apply_mica;
#[cfg(target_os = "macos")]
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

use crate::error::ClipResult;

pub fn on_created<R: Runtime>(window: tauri::Window<R>) -> ClipResult<()> {
    window_beatify(&window)?;
    // 消失时隐藏
    if window.label() == "main" {
        // 设置消失
        let w = window.clone();
        window.on_window_event(move |event| {
            on_window_event(&w, event);
        });
    }
    Ok(())
}

fn on_window_event<R: Runtime>(window: &tauri::Window<R>, event: &WindowEvent) -> ClipResult<()> {
    if let tauri::WindowEvent::Focused(false) = event {
        window.hide()?;
    }
    Ok(())
}

fn window_beatify<R: Runtime>(window: &tauri::Window<R>) -> ClipResult<()> {
    // 修改边框
    set_shadow(&window, true)?;
    // 修改背景
    #[cfg(target_os = "macos")]
    apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None)?;
    #[cfg(target_os = "windows")]
    {
        window.set_decorations(false)?;
        apply_mica(&window)?;
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
    #[cfg(debug_assertions)]
    {
        window.open_devtools();
    }
    Ok(())
}
