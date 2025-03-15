/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 10:33:44
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/plugins/config/config_data.rs
 */
use std::{
    collections::{HashMap, HashSet},
    io::ErrorKind,
    path::PathBuf,
};

use serde::{Deserialize, Serialize};
use tauri::{Manager, Runtime};

use crate::errors::{ChatGPTError, ChatGPTResult};

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

fn default_url() -> String {
    "https://api.openai.com/v1/chat/completions".to_string()
}

fn default_models() -> HashSet<String> {
    let mut models = HashSet::new();
    models.insert("gpt-3.5-turbo".to_string());
    models.insert("gpt-3.5-turbo-16k".to_string());
    models.insert("gpt-3.5-turbo-instruct".to_string());
    models.insert("gpt-4".to_string());
    models.insert("gpt-4-turbo".to_string());
    models
}

#[derive(Clone, Debug, Default, Deserialize, Serialize, PartialEq, Eq)]
pub struct ChatGPTConfig {
    #[serde(rename = "apiKey")]
    api_key: Option<String>,
    #[serde(default = "Default::default")]
    theme: ThemeOption,
    #[serde(default = "default_url")]
    pub url: String,
    #[serde(rename = "httpProxy")]
    pub http_proxy: Option<String>,
    #[serde(default = "default_models")]
    pub models: HashSet<String>,
    #[serde(rename = "temporaryHotkey")]
    pub temporary_hotkey: Option<String>,
    #[serde(rename = "adapterSettings")]
    adapter_settings: HashMap<String, serde_json::Value>,
}

impl ChatGPTConfig {
    pub fn path<R: Runtime>(app: &tauri::AppHandle<R>) -> ChatGPTResult<PathBuf> {
        let file = app
            .path()
            .app_config_dir()
            .map_err(|_| ChatGPTError::DbPath)?
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
    pub fn get_api_key(&self) -> ChatGPTResult<&str> {
        self.api_key.as_deref().ok_or(ChatGPTError::ApiKeyNotSet)
    }
}
