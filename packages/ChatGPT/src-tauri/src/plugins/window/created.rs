use tauri::Runtime;
use window_shadows::set_shadow;
#[cfg(target_os = "windows")]
use window_vibrancy::apply_mica;
#[cfg(target_os = "macos")]
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

use crate::errors::ChatGPTResult;

pub fn on_created<R: Runtime>(window: tauri::Window<R>) -> ChatGPTResult<()> {
    window_beatify(&window)?;
    #[cfg(debug_assertions)]
    {
        if window.label() == "main" {
            window.open_devtools()
        }
    }
    Ok(())
}

fn window_beatify<R: Runtime>(window: &tauri::Window<R>) -> ChatGPTResult<()> {
    // 修改边框
    set_shadow(window, true)?;
    // 修改背景
    #[cfg(target_os = "macos")]
    apply_vibrancy(window, NSVisualEffectMaterial::HudWindow, None, None)?;
    #[cfg(target_os = "windows")]
    {
        apply_mica(window)?;
    }
    // 标题栏
    #[cfg(target_os = "macos")]
    {
        if window.label() == "main" {
            window.set_transparent_titlebar(ToolbarThickness::Thick);
        }
    }
    Ok(())
}

use tauri::Window;

pub trait WindowExt {
    #[cfg(target_os = "macos")]
    fn set_transparent_titlebar(&self, thickness: ToolbarThickness);
    #[cfg(target_os = "macos")]
    fn position_traffic_lights(&self, x: f64, y: f64);
}

impl<R: Runtime> WindowExt for Window<R> {
    #[cfg(target_os = "macos")]
    fn position_traffic_lights(&self, x: f64, y: f64) {
        use cocoa::appkit::{NSView, NSWindow, NSWindowButton};
        use cocoa::foundation::NSRect;

        let window = self.ns_window().unwrap() as cocoa::base::id;

        unsafe {
            let close = window.standardWindowButton_(NSWindowButton::NSWindowCloseButton);
            let miniaturize =
                window.standardWindowButton_(NSWindowButton::NSWindowMiniaturizeButton);
            let zoom = window.standardWindowButton_(NSWindowButton::NSWindowZoomButton);

            let title_bar_container_view = close.superview().superview();

            let close_rect: NSRect = NSView::frame(close);
            let button_height = close_rect.size.height;

            let title_bar_frame_height = button_height + y;
            let mut title_bar_rect = NSView::frame(title_bar_container_view);
            title_bar_rect.size.height = title_bar_frame_height;
            title_bar_rect.origin.y = NSView::frame(window).size.height - title_bar_frame_height;
            title_bar_container_view.setFrameOrigin(title_bar_rect.origin);

            let window_buttons = vec![close, miniaturize, zoom];
            let space_between = NSView::frame(miniaturize).origin.x - NSView::frame(close).origin.x;

            for (i, button) in window_buttons.into_iter().enumerate() {
                let mut rect: NSRect = NSView::frame(button);
                rect.origin.x = x + (i as f64 * space_between);
                button.setFrameOrigin(rect.origin);
            }
        }
    }
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
