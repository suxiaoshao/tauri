use thiserror::Error;

#[derive(Error, Debug, serde::Serialize)]
pub enum ClipError {
    #[error("获取不了剪切板数据库路径")]
    DbPath,
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
    #[error("无父文件夹")]
    Path,
    #[error("页面shadow错误")]
    Shadow,
    #[error("页面透明效果错误")]
    Vibrancy,
}

impl From<tauri::Error> for ClipError {
    fn from(error: tauri::Error) -> Self {
        match error {
            tauri::Error::Setup(_) => Self::Setup(error),
            _ => Self::Tauri(error),
        }
    }
}

impl From<diesel::result::Error> for ClipError {
    fn from(error: diesel::result::Error) -> Self {
        Self::Sqlite(error)
    }
}
impl From<diesel::ConnectionError> for ClipError {
    fn from(error: diesel::ConnectionError) -> Self {
        Self::Connection(error)
    }
}
impl From<diesel::r2d2::PoolError> for ClipError {
    fn from(error: diesel::r2d2::PoolError) -> Self {
        Self::Pool(error)
    }
}
impl From<window_shadows::Error> for ClipError {
    fn from(_: window_shadows::Error) -> Self {
        Self::Shadow
    }
}
impl From<window_vibrancy::Error> for ClipError {
    fn from(_: window_vibrancy::Error) -> Self {
        Self::Vibrancy
    }
}

pub type ClipResult<T> = Result<T, ClipError>;
