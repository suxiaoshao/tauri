use tauri::Manager;
use tauri::Runtime;
use tauri::menu::Menu;
use tauri::menu::MenuItem;
use tauri::menu::PredefinedMenuItem;
use tauri::tray::TrayIcon;

use crate::errors::HttpResult;
use crate::plugin::window::create_main_window;

pub struct TrayPlugin;

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

fn init_tray<R: Runtime>(tray_icon: TrayIcon<R>, app: &tauri::AppHandle<R>) -> HttpResult<()> {
    let version = get_app_version();
    let tray_menu = Menu::with_items(
        app,
        &[
            &MenuItem::with_id(app, OPEN, "Open", true, None::<&str>)?,
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
    tray_icon.set_tooltip(Some("Http Client"))?;
    tray_icon.set_show_menu_on_left_click(true)?;
    tray_icon.on_menu_event(|app, event| {
        if let OPEN = event.id().as_ref()
            && let Err(err) = create_main(app)
        {
            log::warn!("tray click error:{err}")
        }
    });
    Ok(())
}

fn create_main<R: Runtime>(app: &tauri::AppHandle<R>) -> HttpResult<()> {
    match app.get_webview_window("main") {
        Some(window) => {
            window.show()?;
            window.set_focus()?;
        }
        None => {
            create_main_window(app)?;
        }
    };
    Ok(())
}
