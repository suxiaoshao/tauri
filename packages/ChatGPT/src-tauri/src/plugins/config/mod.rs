use tauri::{Invoke, Manager, Runtime, WindowBuilder};

use crate::errors::ChatGPTResult;
mod config_data;

pub struct ConfigPlugin;

impl<R: Runtime> tauri::plugin::Plugin<R> for ConfigPlugin {
    fn name(&self) -> &'static str {
        "config"
    }
    fn initialize(
        &mut self,
        app: &tauri::AppHandle<R>,
        _config: serde_json::Value,
    ) -> tauri::plugin::Result<()> {
        initialize(app)?;
        Ok(())
    }
    fn extend_api(&mut self, invoke: tauri::Invoke<R>) {
        let handle: Box<dyn Fn(Invoke<R>) + Send + Sync> = Box::new(tauri::generate_handler![
            set_config,
            get_config,
            create_setting_window
        ]);
        (handle)(invoke);
    }
}
fn initialize<R: Runtime>(app: &tauri::AppHandle<R>) -> ChatGPTResult<()> {
    //data path
    ChatGPTConfig::get(app)?;
    // let path = ChatGPTConfig::path(app)?;
    // let app2 = app.clone();
    // let mut watcher = notify::recommended_watcher(move |res| match res {
    //     Ok(_) => {
    //         println!("config file changed");
    //         match ChatGPTConfig::get(&app2) {
    //             Ok(config) => {
    //                 println!("config changed:{:?}", config);
    //                 if let Err(err) = app2.emit_to("main", "config", config) {
    //                     log::error!("emit config error:{err}");
    //                 };
    //             }
    //             Err(err) => {
    //                 log::error!("config file error:{err}");
    //             }
    //         };
    //     }
    //     Err(err) => {
    //         log::error!("watch file error:{err}");
    //     }
    // })?;
    // watcher.watch(&path, RecursiveMode::Recursive)?;
    // println!("watch config file:{:?}", path);
    Ok(())
}

#[tauri::command]
fn set_config<R: Runtime>(
    app_handle: tauri::AppHandle<R>,
    data: ChatGPTConfig,
) -> ChatGPTResult<()> {
    data.save(&app_handle)?;
    app_handle.emit_to("main", "config", &data)?;
    Ok(())
}

#[tauri::command]
fn get_config<R: Runtime>(app_handle: tauri::AppHandle<R>) -> ChatGPTResult<ChatGPTConfig> {
    let state = ChatGPTConfig::get(&app_handle)?;
    Ok(state)
}

#[tauri::command]
async fn create_setting_window<R: Runtime>(
    app: tauri::AppHandle<R>,
    window: tauri::Window<R>,
) -> ChatGPTResult<()> {
    match app.get_window("setting") {
        Some(window) => {
            window.show()?;
            window.set_focus()?;
        }
        None => {
            let child =
                WindowBuilder::new(&app, "setting", tauri::WindowUrl::App("/setting".into()))
                    .title("setting")
                    .transparent(true)
                    .decorations(false);

            #[cfg(target_os = "macos")]
            let child = child.parent_window(window.ns_window().unwrap());
            #[cfg(windows)]
            let child = child.owner_window(window.hwnd().unwrap());
            child.build()?;
        }
    };
    Ok(())
}

pub use config_data::ChatGPTConfig;
