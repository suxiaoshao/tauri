use tauri::CustomMenuItem;
use tauri::Runtime;
use tauri::SystemTray;
use tauri::SystemTrayMenu;
use tauri::SystemTrayMenuItem;

use crate::errors::ChatGPTResult;

pub struct TrayPlugin;

const QUIT: &str = "quit";
const TEMPORARY: &str = "temporary";
const OPEN: &str = "open";

fn get_app_version() -> &'static str {
    env!("CARGO_PKG_VERSION")
}

impl<R: Runtime> tauri::plugin::Plugin<R> for TrayPlugin {
    fn name(&self) -> &'static str {
        "tray"
    }
    fn initialize(
        &mut self,
        app: &tauri::AppHandle<R>,
        _config: serde_json::Value,
    ) -> tauri::plugin::Result<()> {
        if let Err(err) = init_tray(app) {
            log::warn!("tray init error:{}", err)
        }
        Ok(())
    }
}

fn init_tray<R: Runtime>(app: &tauri::AppHandle<R>) -> ChatGPTResult<()> {
    let version = get_app_version();
    let tray_menu = SystemTrayMenu::new()
        .add_item(CustomMenuItem::new(OPEN, "Open ChatGPT"))
        .add_item(
            CustomMenuItem::new(TEMPORARY, "Open Temporary Conversation").accelerator("Option+F"),
        )
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(CustomMenuItem::new(
            "version",
            format!("Version(V{})", version).as_str(),
        ))
        .add_item(CustomMenuItem::new("about", "About"))
        .add_item(CustomMenuItem::new(QUIT, "Quit").accelerator("CmdOrCtrl+Q"));
    let app_handle = app.clone();
    let tray = SystemTray::new()
        .with_menu(tray_menu)
        .on_event(move |event| {
            if let tauri::SystemTrayEvent::MenuItemClick { id, .. } = event {
                match id.as_str() {
                    QUIT => {
                        app_handle.exit(0);
                    }
                    TEMPORARY => {
                        if let Err(err) = super::temporary_conversation::on_short(&app_handle) {
                            log::warn!("tray click error:{}", err)
                        }
                    }
                    OPEN => {
                        todo!()
                    }
                    _ => {}
                }
            }
        })
        .with_title("ChatGPT")
        .with_tooltip("ChatGPT");
    tray.build(app)?;
    Ok(())
}
