use std::{path::PathBuf, sync::PoisonError};

use serde::{Serialize, Serializer, ser::SerializeStruct};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ChatGPTError {
    #[error("获取不了配置路径")]
    ConfigPath,
    #[error("初始化错误:{}",.0)]
    Setup(#[source] tauri::Error),
    #[error("tauri错误:{}",.0)]
    Tauri(#[source] tauri::Error),
    #[error("数据库错误:{}",.0)]
    Sqlite(#[source] diesel::result::Error),
    #[error("数据库连接错误:{}",.0)]
    Connection(#[source] diesel::ConnectionError),
    #[error("数据库连接池错误:{}",.0)]
    Pool(#[source] diesel::r2d2::PoolError),
    #[error("数据库连接池获取链接错误:{}",.0)]
    GetConnection(#[from] diesel::r2d2::Error),
    #[error("文件系统错误:{}",.0)]
    Fs(#[from] std::io::Error),
    #[error("页面透明效果错误")]
    Vibrancy,
    #[error("请求头构造错误:{}",.0)]
    HeaderParse(#[from] reqwest::header::InvalidHeaderValue),
    #[error("请求错误:{}",.0)]
    Request(#[from] reqwest::Error),
    #[error("toml解析错误:{}",.0)]
    TomlParse(#[from] toml::de::Error),
    #[error("toml序列化错误:{}",.0)]
    TomlSerialize(#[from] toml::ser::Error),
    #[error("notify watcher错误:{}",.0)]
    Notify(#[from] notify::Error),
    #[error("eventsource错误:{}",.0)]
    EventSource(#[from] reqwest_eventsource::CannotCloneRequestError),
    #[error("serde_json错误:{}",.0)]
    SerdeJson(#[from] serde_json::Error),
    #[error("api key未设置")]
    ApiKeyNotSet,
    #[error("无父文件夹")]
    Path,
    #[error("获取不了历史记录数据库路径")]
    DbPath,
    #[error("无效的模式:{}",.0)]
    InvalidMode(String),
    #[error("无效的角色:{}",.0)]
    InvalidRole(String),
    #[error("无效的消息状态:{}",.0)]
    InvalidMessageStatus(String),
    #[error("无效的时间格式:{}",.0)]
    InvalidTimeFormat(#[from] time::error::IndeterminateOffset),
    #[error("无效的 model:{}",.0)]
    InvalidModel(String),
    #[error("窗口不存在")]
    WindowNotFound,
    #[error("conversation path exists:{}",.0)]
    ConversationPathExists(String),
    #[error("folder path exists:{}",.0)]
    FolderPathExists(String),
    #[error("csv 解析失败:{}",.0)]
    CsvParse(#[from] csv::Error),
    #[error("这个 template 的 conversation 还存在,不能删除")]
    TemplateHasConversation,
    #[error("智能指针错误")]
    Rc,
    #[error("Temporary message not found:{}",.0)]
    TemporaryMessageNotFound(usize),
    #[error("Temporary conversation uninitialized")]
    TemporaryConversationUninitialized,
    #[error("Temporary conversation not found:{}",.0)]
    TemporaryConversationNotFound(usize),
    #[error("global shortcuts:{}",.0)]
    GlobalShortcuts(#[from] tauri_plugin_global_shortcut::Error),
    #[error("adapter {} settings not found",.0)]
    AdapterSettingsNotFound(String),
    #[error("adapter {} not found",.0)]
    AdapterNotFound(String),
    #[error("Wasmtime engine creation failed")]
    WasmtimeEngineCreationFailed,
    #[error("Wasmtime component creation failed")]
    WasmtimeComponentCreationFailed(PathBuf),
    #[error("Wasmtime error")]
    WasmtimeError,
    #[error("Extension {} not found",.0)]
    ExtensionNotFound(String),
    #[error("Extension {} error",.0)]
    ExtensionError(String),
    #[error("Extension runtime error")]
    ExtensionRuntimeError,
}

impl Serialize for ChatGPTError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        let mut state = serializer.serialize_struct("ChatGPTError", 3)?;
        state.serialize_field("message", &self.to_string())?;
        match self {
            ChatGPTError::ConfigPath => {
                state.serialize_field("code", "ConfigPath")?;
            }
            ChatGPTError::Setup(_) => {
                state.serialize_field("code", "Setup")?;
            }
            ChatGPTError::Tauri(_) => {
                state.serialize_field("code", "Tauri")?;
            }
            ChatGPTError::Sqlite(_) => {
                state.serialize_field("code", "Sqlite")?;
            }
            ChatGPTError::Connection(_) => {
                state.serialize_field("code", "Connection")?;
            }
            ChatGPTError::Pool(_) => {
                state.serialize_field("code", "Pool")?;
            }
            ChatGPTError::GetConnection(_) => {
                state.serialize_field("code", "GetConnection")?;
            }
            ChatGPTError::Fs(_) => {
                state.serialize_field("code", "Fs")?;
            }
            ChatGPTError::Vibrancy => {
                state.serialize_field("code", "Vibrancy")?;
            }
            ChatGPTError::HeaderParse(_) => {
                state.serialize_field("code", "HeaderParse")?;
            }
            ChatGPTError::Request(_) => {
                state.serialize_field("code", "Request")?;
            }
            ChatGPTError::TomlParse(_) => {
                state.serialize_field("code", "TomlParse")?;
            }
            ChatGPTError::TomlSerialize(_) => {
                state.serialize_field("code", "TomlSerialize")?;
            }
            ChatGPTError::Notify(_) => {
                state.serialize_field("code", "Notify")?;
            }
            ChatGPTError::EventSource(_) => {
                state.serialize_field("code", "EventSource")?;
            }
            ChatGPTError::SerdeJson(_) => {
                state.serialize_field("code", "SerdeJson")?;
            }
            ChatGPTError::ApiKeyNotSet => {
                state.serialize_field("code", "ApiKeyNotSet")?;
            }
            ChatGPTError::Path => {
                state.serialize_field("code", "Path")?;
            }
            ChatGPTError::DbPath => {
                state.serialize_field("code", "DbPath")?;
            }
            ChatGPTError::InvalidMode(mode) => {
                state.serialize_field("code", "InvalidMode")?;
                state.serialize_field("data", mode)?;
            }
            ChatGPTError::InvalidRole(role) => {
                state.serialize_field("code", "InvalidRole")?;
                state.serialize_field("data", role)?;
            }
            ChatGPTError::InvalidMessageStatus(status) => {
                state.serialize_field("code", "InvalidMessageStatus")?;
                state.serialize_field("data", status)?;
            }
            ChatGPTError::InvalidTimeFormat(_) => {
                state.serialize_field("code", "InvalidTimeFormat")?;
            }
            ChatGPTError::InvalidModel(model) => {
                state.serialize_field("code", "InvalidModel")?;
                state.serialize_field("data", model)?;
            }
            ChatGPTError::WindowNotFound => {
                state.serialize_field("code", "WindowNotFound")?;
            }
            ChatGPTError::ConversationPathExists(path) => {
                state.serialize_field("code", "ConversationPathExists")?;
                state.serialize_field("data", path)?;
            }
            ChatGPTError::FolderPathExists(path) => {
                state.serialize_field("code", "FolderPathExists")?;
                state.serialize_field("data", path)?;
            }
            ChatGPTError::CsvParse(_) => {
                state.serialize_field("code", "CsvParse")?;
            }
            ChatGPTError::TemplateHasConversation => {
                state.serialize_field("code", "TemplateHasConversation")?;
            }
            ChatGPTError::Rc => {
                state.serialize_field("code", "Rc")?;
            }
            ChatGPTError::TemporaryMessageNotFound(id) => {
                state.serialize_field("code", "TemporaryMessageNotFound")?;
                state.serialize_field("data", id)?;
            }
            ChatGPTError::TemporaryConversationUninitialized => {
                state.serialize_field("code", "TemporaryConversationUninitialized")?;
            }
            ChatGPTError::TemporaryConversationNotFound(id) => {
                state.serialize_field("code", "TemporaryConversationNotFound")?;
                state.serialize_field("data", id)?;
            }
            ChatGPTError::GlobalShortcuts(error) => {
                state.serialize_field("code", "GlobalShortcuts")?;
                state.serialize_field("data", error)?;
            }
            ChatGPTError::AdapterSettingsNotFound(error) => {
                state.serialize_field("code", "AdapterSettingsNotFound")?;
                state.serialize_field("data", error)?;
            }
            ChatGPTError::AdapterNotFound(error) => {
                state.serialize_field("code", "AdapterNotFound")?;
                state.serialize_field("data", error)?;
            }
            ChatGPTError::WasmtimeEngineCreationFailed => {
                state.serialize_field("code", "WasmtimeEngineCreationFailed")?;
            }
            ChatGPTError::WasmtimeComponentCreationFailed(path) => {
                state.serialize_field("code", "WasmtimeComponentCreationFailed")?;
                state.serialize_field("data", path)?;
            }
            ChatGPTError::WasmtimeError => {
                state.serialize_field("code", "WasmtimeError")?;
            }
            ChatGPTError::ExtensionNotFound(extension_name) => {
                state.serialize_field("code", "ExtensionNotFound")?;
                state.serialize_field("data", extension_name)?;
            }
            ChatGPTError::ExtensionError(name) => {
                state.serialize_field("code", "ExtensionError")?;
                state.serialize_field("data", name)?;
            }
            ChatGPTError::ExtensionRuntimeError => {
                state.serialize_field("code", "ExtensionRuntimeError")?;
            }
        }
        state.end()
    }
}

impl From<tauri::Error> for ChatGPTError {
    fn from(error: tauri::Error) -> Self {
        match error {
            tauri::Error::Setup(_) => Self::Setup(error),
            _ => Self::Tauri(error),
        }
    }
}

impl From<diesel::result::Error> for ChatGPTError {
    fn from(error: diesel::result::Error) -> Self {
        Self::Sqlite(error)
    }
}
impl From<diesel::ConnectionError> for ChatGPTError {
    fn from(error: diesel::ConnectionError) -> Self {
        Self::Connection(error)
    }
}
impl From<diesel::r2d2::PoolError> for ChatGPTError {
    fn from(error: diesel::r2d2::PoolError) -> Self {
        Self::Pool(error)
    }
}
impl From<window_vibrancy::Error> for ChatGPTError {
    fn from(_: window_vibrancy::Error) -> Self {
        Self::Vibrancy
    }
}

impl<Guard> From<PoisonError<Guard>> for ChatGPTError {
    fn from(_: PoisonError<Guard>) -> Self {
        Self::Rc
    }
}

pub type ChatGPTResult<T> = Result<T, ChatGPTError>;
