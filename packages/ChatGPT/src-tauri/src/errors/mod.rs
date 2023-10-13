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
    #[error("eventsource错误:{}",.0)]
    EventSource(
        #[serde(skip_serializing)]
        #[from]
        reqwest_eventsource::CannotCloneRequestError,
    ),
    #[error("serde_json错误:{}",.0)]
    SerdeJson(
        #[serde(skip_serializing)]
        #[from]
        serde_json::Error,
    ),
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
    InvalidTimeFormat(
        #[serde(skip_serializing)]
        #[from]
        time::error::IndeterminateOffset,
    ),
    #[error("无效的 model:{}",.0)]
    InvalidModel(String),
    #[error("窗口不存在")]
    WindowNotFound,
    #[error("conversation path exists:{}",.0)]
    ConversationPathExists(String),
    #[error("folder path exists:{}",.0)]
    FolderPathExists(String),
    #[error("csv 解析失败:{}",.0)]
    CsvParse(
        #[serde(skip_serializing)]
        #[from]
        csv::Error,
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
