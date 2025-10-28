/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 10:32:15
 * @FilePath: /tauri/packages/Hclipboard/src-tauri/src/plugin/window/shortcut.rs
 */
#[cfg(target_os = "macos")]
use objc2::rc::Retained;
#[cfg(target_os = "macos")]
use objc2_app_kit::{NSApplicationActivationOptions, NSRunningApplication, NSWorkspace};
#[cfg(target_os = "macos")]
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Manager, Runtime, WebviewWindowBuilder};

use crate::error::ClipResult;

#[cfg(target_os = "macos")]
fn record_frontmost_app() -> Option<Retained<NSRunningApplication>> {
    // 获取 [NSWorkspace sharedWorkspace].frontmostApplication
    let workspace = unsafe { NSWorkspace::sharedWorkspace() };
    unsafe { workspace.frontmostApplication() }
}

#[cfg(target_os = "macos")]
pub fn restore_frontmost_app(prev_app: &Option<Retained<NSRunningApplication>>) {
    // 调用 [prevApp activateWithOptions:NSApplicationActivateIgnoringOtherApps]
    const NSAPPLICATION_ACTIVATE_IGNORING_OTHER_APPS: usize = 1 << 1;
    if let Some(app) = prev_app.as_ref() {
        unsafe {
            app.activateWithOptions(NSApplicationActivationOptions(
                NSAPPLICATION_ACTIVATE_IGNORING_OTHER_APPS,
            ));
        }
    }
}

#[cfg(target_os = "macos")]
pub type FrontmostApp = Arc<Mutex<Option<Retained<NSRunningApplication>>>>;

pub fn on_short<R: Runtime>(app: &AppHandle<R>) -> ClipResult<()> {
    if let Some(window) = app.get_webview_window("main") {
        if window.is_visible()? {
            window.hide()?;
            #[cfg(target_os = "macos")]
            {
                let prev_app = app.try_state::<FrontmostApp>();
                if let Some(prev_app) = prev_app {
                    let prev_app = prev_app.inner().lock().unwrap();

                    restore_frontmost_app(&prev_app);
                };
            }
        } else {
            #[cfg(target_os = "macos")]
            {
                let prev_app = record_frontmost_app();
                match app.try_state::<FrontmostApp>() {
                    Some(old_prev_app) => {
                        *old_prev_app.lock().unwrap() = prev_app;
                    }
                    None => {
                        app.manage(Arc::new(Mutex::new(prev_app)));
                    }
                }
            }

            window.show()?;
            window.set_focus()?;
        }
    } else {
        #[cfg(target_os = "macos")]
        {
            let prev_app = record_frontmost_app();
            match app.try_state::<FrontmostApp>() {
                Some(old_prev_app) => {
                    *old_prev_app.lock().unwrap() = prev_app;
                }
                None => {
                    app.manage(Arc::new(Mutex::new(prev_app)));
                }
            }
        }
        create_main_window(app)?;
    }
    Ok(())
}

fn create_main_window<R: Runtime>(app: &AppHandle<R>) -> ClipResult<()> {
    let window = WebviewWindowBuilder::new(app, "main", Default::default())
        .title("Hclipboard")
        .fullscreen(false)
        .inner_size(800.0, 600.0)
        .skip_taskbar(true)
        .transparent(true)
        .always_on_top(true)
        .title_bar_style(tauri::TitleBarStyle::Overlay)
        .hidden_title(true)
        .build()?;

    window.show()?;
    window.set_focus()?;

    Ok(())
}
