use thiserror::Error;

#[derive(Error, Debug)]
pub enum ClipError {
    #[error("获取不了剪切板数据库路径")]
    DbPath,
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

pub type ClipResult<T> = Result<T, ClipError>;
