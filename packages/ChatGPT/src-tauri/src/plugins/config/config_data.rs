use std::{io::ErrorKind, path::PathBuf};

use serde::{Deserialize, Serialize};
use tauri::{api::path::app_config_dir, Runtime};

use crate::errors::{ChatGPTError, ChatGPTResult};

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
pub struct ChatGPTConfig {
    api_key: Option<String>,
}

impl ChatGPTConfig {
    pub fn path<R: Runtime>(app: &tauri::AppHandle<R>) -> ChatGPTResult<PathBuf> {
        let file = app_config_dir(&app.config())
            .ok_or(ChatGPTError::ConfigPath)?
            .join("config.toml");
        Ok(file)
    }
    pub fn save<R: Runtime>(&self, app: &tauri::AppHandle<R>) -> ChatGPTResult<()> {
        let config_path = Self::path(app)?;
        let config_str = toml::to_string_pretty(&self)?;
        std::fs::write(config_path, config_str)?;
        Ok(())
    }
    pub fn get<R: Runtime>(app: &tauri::AppHandle<R>) -> ChatGPTResult<Self> {
        //data path
        let config_path = ChatGPTConfig::path(app)?;
        let config = match std::fs::read_to_string(&config_path) {
            Ok(file) => toml::from_str(&file)?,
            Err(e) => {
                if let ErrorKind::NotFound = e.kind() {
                    let config = Self::default();
                    let config_str = toml::to_string_pretty(&config)?;
                    std::fs::write(&config_path, config_str)?;
                    config
                } else {
                    return Err(e.into());
                }
            }
        };
        Ok(config)
    }
}
