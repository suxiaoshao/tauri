/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 10:33:44
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/plugins/config/config_data.rs
 */
use crate::errors::{ChatGPTError, ChatGPTResult};
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, io::ErrorKind, path::PathBuf};
use tauri::{Manager, Runtime};

const CONFIG_FILE_NAME: &str = "config.toml";

#[derive(Debug, Clone, Copy, Default, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
enum Theme {
    Dark,
    Light,
    #[default]
    #[serde(other)]
    System,
}

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
struct ThemeOption {
    theme: Theme,
    color: String,
}

impl Default for ThemeOption {
    fn default() -> Self {
        Self {
            theme: Default::default(),
            color: "#3271ae".to_string(),
        }
    }
}

#[derive(Clone, Debug, Default, Deserialize, Serialize, PartialEq, Eq)]
pub struct ChatGPTConfig {
    #[serde(default = "Default::default")]
    theme: ThemeOption,
    #[serde(rename = "httpProxy")]
    pub http_proxy: Option<String>,
    #[serde(rename = "temporaryHotkey")]
    pub temporary_hotkey: Option<String>,
    #[serde(rename = "adapterSettings", default)]
    adapter_settings: HashMap<String, serde_json::Value>,
}

impl ChatGPTConfig {
    pub fn path<R: Runtime>(app: &tauri::AppHandle<R>) -> ChatGPTResult<PathBuf> {
        let file = app
            .path()
            .app_config_dir()
            .map_err(|_| ChatGPTError::DbPath)?;
        if !file.exists() {
            std::fs::create_dir_all(&file)?;
        }
        let file = file.join(CONFIG_FILE_NAME);
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
    pub(crate) fn get_adapter_settings(&self, adapter: &str) -> Option<&serde_json::Value> {
        self.adapter_settings.get(adapter)
    }
    pub(crate) fn get_http_proxy(&self) -> Option<&str> {
        self.http_proxy.as_deref()
    }
}
