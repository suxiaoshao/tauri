use std::io::ErrorKind;

use tauri::{api::path::app_config_dir, Invoke, Manager, Runtime};

use crate::errors::{ChatGPTError, ChatGPTResult};
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
            open_setting
        ]);
        (handle)(invoke);
    }
}
fn initialize<R: Runtime>(app: &tauri::AppHandle<R>) -> ChatGPTResult<()> {
    //data path
    let config_path = app_config_dir(&app.config())
        .ok_or(ChatGPTError::ConfigPath)?
        .join("config.toml")
        .to_str()
        .ok_or(ChatGPTError::ConfigPath)?
        .to_string();
    let config = match std::fs::read_to_string(&config_path) {
        Ok(file) => toml::from_str(&file)?,
        Err(e) => {
            if let ErrorKind::NotFound = e.kind() {
                let config = config_data::ChatGPTConfig::default();
                let config_str = toml::to_string_pretty(&config)?;
                std::fs::write(&config_path, config_str)?;
                config
            } else {
                return Err(e.into());
            }
        }
    };
    app.manage(config);
    Ok(())
}

#[tauri::command]
fn set_config<R: Runtime>(
    app_handle: tauri::AppHandle<R>,
    data: ChatGPTConfig,
) -> ChatGPTResult<()> {
    app_handle.manage(data);
    Ok(())
}

#[tauri::command]
fn get_config(state: tauri::State<ChatGPTConfig>) -> ChatGPTResult<ChatGPTConfig> {
    Ok(state.inner().clone())
}

#[tauri::command]
async fn open_setting<R: Runtime>(app: tauri::AppHandle<R>) -> ChatGPTResult<()> {
    tauri::WindowBuilder::new(&app, "setting", tauri::WindowUrl::App("setting".into()))
        .transparent(true)
        .build()?;
    Ok(())
}

pub use config_data::ChatGPTConfig;
