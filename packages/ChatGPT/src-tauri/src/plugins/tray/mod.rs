/*
 * @Author: suxiaoshao suxiaoshao@gamil.com
 * @Date: 2024-05-08 21:58:29
 * @LastEditors: suxiaoshao suxiaoshao@gamil.com
 * @LastEditTime: 2024-05-16 08:47:28
 * @FilePath: \tauri\packages\ChatGPT\src-tauri\src\plugins\tray\mod.rs
 */
use tauri::Manager;
use tauri::Runtime;
use tauri::menu::Menu;
use tauri::menu::MenuItem;
use tauri::menu::PredefinedMenuItem;
use tauri::tray::TrayIcon;

use crate::create_main_window;
use crate::errors::ChatGPTResult;

pub struct TrayPlugin;

const TEMPORARY: &str = "temporary";
const OPEN: &str = "open";

fn get_app_version() -> &'static str {
    env!("CARGO_PKG_VERSION")
}

impl<R: Runtime> tauri::plugin::Plugin<R> for TrayPlugin {
    fn name(&self) -> &'static str {
        "tray-config"
    }
    fn initialize(
        &mut self,
        app: &tauri::AppHandle<R>,
        _config: serde_json::Value,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let tray = app.tray_by_id("main");
        if let Some(tray) = tray
            && let Err(err) = init_tray(tray, app)
        {
            log::warn!("tray init error:{err}")
        }

        Ok(())
    }
}

fn init_tray<R: Runtime>(tray_icon: TrayIcon<R>, app: &tauri::AppHandle<R>) -> ChatGPTResult<()> {
    let version = get_app_version();
    let tray_menu = Menu::with_items(
        app,
        &[
            &MenuItem::with_id(app, OPEN, "Open ChatGPT", true, None::<&str>)?,
            &MenuItem::with_id(
                app,
                TEMPORARY,
                "Open Temporary Conversation",
                true,
                Some("Option+F"),
            )?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(
                app,
                "version",
                format!("Version(V{version})"),
                true,
                None::<&str>,
            )?,
            &PredefinedMenuItem::about(app, None, None)?,
            &PredefinedMenuItem::quit(app, None)?,
        ],
    )?;
    tray_icon.set_menu(Some(tray_menu))?;
    tray_icon.set_tooltip(Some("ChatGPT"))?;
    tray_icon.set_show_menu_on_left_click(true)?;
    tray_icon.on_menu_event(|app, event| match event.id().as_ref() {
        TEMPORARY => {
            if let Err(err) = super::temporary_conversation::trigger_temp_window(app) {
                log::warn!("tray click error:{err}")
            }
        }
        OPEN => {
            if let Err(err) = create_main(app) {
                log::warn!("tray click error:{err}")
            }
        }
        _ => {}
    });
    Ok(())
}

fn create_main<R: Runtime>(app: &tauri::AppHandle<R>) -> ChatGPTResult<()> {
    match app.get_webview_window("main") {
        Some(window) => {
            window.show()?;
            window.set_focus()?;
        }
        None => {
            create_main_window(app, "/")?;
        }
    };
    Ok(())
}
