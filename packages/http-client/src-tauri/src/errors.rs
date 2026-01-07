use std::string::FromUtf8Error;

use thiserror::Error;

#[derive(Error, Debug, serde::Serialize)]
pub enum HttpError {
    #[error("初始化错误:{}",.0)]
    Setup(
        #[serde(skip_serializing)]
        #[source]
        tauri::Error,
    ),
    #[error("tauri错误:{}",.0)]
    Tauri(
        #[serde(skip_serializing)]
        #[source]
        tauri::Error,
    ),
    #[error("数据库错误:{}",.0)]
    Sqlite(
        #[serde(skip_serializing)]
        #[source]
        diesel::result::Error,
    ),
    #[error("数据库连接错误:{}",.0)]
    Connection(
        #[serde(skip_serializing)]
        #[source]
        diesel::ConnectionError,
    ),
    #[error("文件系统错误:{}",.0)]
    Fs(
        #[serde(skip_serializing)]
        #[from]
        std::io::Error,
    ),
    #[error("页面透明效果错误")]
    Vibrancy,
    #[error("global shortcuts:{}",.0)]
    GlobalShortcuts(#[from] tauri_plugin_global_shortcut::Error),
    #[error("serde error:{}",.0)]
    Serde(
        #[serde(skip_serializing)]
        #[from]
        serde_json::Error,
    ),
    #[error("string error")]
    StringError(
        #[serde(skip_serializing)]
        #[from]
        FromUtf8Error,
    ),
}

impl From<tauri::Error> for HttpError {
    fn from(error: tauri::Error) -> Self {
        match error {
            tauri::Error::Setup(_) => Self::Setup(error),
            _ => Self::Tauri(error),
        }
    }
}

impl From<diesel::result::Error> for HttpError {
    fn from(error: diesel::result::Error) -> Self {
        Self::Sqlite(error)
    }
}
impl From<diesel::ConnectionError> for HttpError {
    fn from(error: diesel::ConnectionError) -> Self {
        Self::Connection(error)
    }
}

impl From<window_vibrancy::Error> for HttpError {
    fn from(_: window_vibrancy::Error) -> Self {
        Self::Vibrancy
    }
}

pub type HttpResult<T> = Result<T, HttpError>;
