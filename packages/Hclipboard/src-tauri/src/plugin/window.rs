use serde_json::Value;
use tauri::{AppHandle, GlobalShortcutManager, Manager, Runtime};
use tauri_plugin_positioner::{Position, WindowExt};
use window_shadows::set_shadow;
#[cfg(target_os = "windows")]
use window_vibrancy::apply_blur;
#[cfg(target_os = "macos")]
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

pub struct WindowPlugin;

impl<R: Runtime> tauri::plugin::Plugin<R> for WindowPlugin {
    fn name(&self) -> &'static str {
        "window"
    }
    fn initialize(&mut self, app: &AppHandle<R>, _: Value) -> tauri::plugin::Result<()> {
        let mut manager = app.global_shortcut_manager();
        let app = app.clone();
        // 全局快捷键
        manager
            .register(
                if cfg!(target_os = "macos") {
                    "Command+Y"
                } else {
                    "Ctrl+Y"
                },
                move || {
                    let window = app.get_window("main").unwrap();
                    if window.is_visible().unwrap() {
                        window.hide().unwrap();
                    } else {
                        // 设置位置
                        window.show().unwrap();
                        window.set_focus().unwrap();
                        window.move_window(Position::Center).unwrap();
                    }
                },
            )
            .map_err(tauri::Error::Runtime)
            .unwrap();
        Ok(())
    }
    fn created(&mut self, window: tauri::Window<R>) {
        // 修改边框
        set_shadow(&window, true).unwrap();
        // 修改背景
        #[cfg(target_os = "macos")]
        apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None)
            .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");
        #[cfg(target_os = "windows")]
        apply_blur(&window, Some((18, 18, 18, 125)))
            .expect("Unsupported platform! 'apply_blur' is only supported on Windows");
        // 消失时隐藏
        if window.label() == "main" {
            // 设置消失
            let w = window.clone();
            window.on_window_event(move |event| {
                if let tauri::WindowEvent::Focused(false) = event {
                    w.hide().unwrap();
                }
            });
            // 标题栏
            #[cfg(target_os = "macos")]
            {
                use cocoa::appkit::{NSWindow, NSWindowStyleMask, NSWindowTitleVisibility};
                unsafe {
                    let id = window.ns_window().unwrap() as cocoa::base::id;
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
        }
    }
}
