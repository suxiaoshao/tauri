use thiserror::Error;

#[derive(Error, Debug, serde::Serialize)]
pub enum ChatGPTError {
    #[error("获取不了配置路径")]
    ConfigPath,
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
    #[error("数据库连接池错误:{}",.0)]
    Pool(
        #[serde(skip_serializing)]
        #[source]
        diesel::r2d2::PoolError,
    ),
    #[error("数据库连接池获取链接错误:{}",.0)]
    GetConnection(
        #[serde(skip_serializing)]
        #[from]
        diesel::r2d2::Error,
    ),
    #[error("文件系统错误:{}",.0)]
    Fs(
        #[serde(skip_serializing)]
        #[from]
        std::io::Error,
    ),
    #[error("页面shadow错误")]
    Shadow,
    #[error("页面透明效果错误")]
    Vibrancy,
    #[error("请求头构造错误:{}",.0)]
    HeaderParse(
        #[serde(skip_serializing)]
        #[from]
        reqwest::header::InvalidHeaderValue,
    ),
    #[error("请求错误:{}",.0)]
    Request(
        #[serde(skip_serializing)]
        #[from]
        reqwest::Error,
    ),
    #[error("toml解析错误:{}",.0)]
    TomlParse(
        #[serde(skip_serializing)]
        #[from]
        toml::de::Error,
    ),
    #[error("toml序列化错误:{}",.0)]
    TomlSerialize(
        #[serde(skip_serializing)]
        #[from]
        toml::ser::Error,
    ),
    #[error("notify watcher错误:{}",.0)]
    Notify(
        #[serde(skip_serializing)]
        #[from]
        notify::Error,
    ),
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
impl From<window_shadows::Error> for ChatGPTError {
    fn from(_: window_shadows::Error) -> Self {
        Self::Shadow
    }
}
impl From<window_vibrancy::Error> for ChatGPTError {
    fn from(_: window_vibrancy::Error) -> Self {
        Self::Vibrancy
    }
}

pub type ChatGPTResult<T> = Result<T, ChatGPTError>;
