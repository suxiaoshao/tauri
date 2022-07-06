use reqwest::Error;
use std::num::ParseIntError;

#[derive(thiserror::Error, Debug)]
pub(crate) enum MovieErrors {
    #[error("{}",.0)]
    Netword(reqwest::Error),
    #[error("没有找到相关内容")]
    SelectNotFound,
    #[error("attr 没有找到相关内容")]
    AttrNotFound,
    #[error("解析错误")]
    ParseError,
    #[error("{}",.0)]
    Json(serde_json::Error),
    #[error("{}",.0)]
    Io(std::io::Error),
}
pub(crate) type MovieResult<T> = Result<T, MovieErrors>;

impl From<reqwest::Error> for MovieErrors {
    fn from(value: Error) -> Self {
        Self::Netword(value)
    }
}

impl From<ParseIntError> for MovieErrors {
    fn from(_value: ParseIntError) -> Self {
        Self::ParseError
    }
}

impl From<serde_json::Error> for MovieErrors {
    fn from(value: serde_json::Error) -> Self {
        Self::Json(value)
    }
}

impl From<std::io::Error> for MovieErrors {
    fn from(value: std::io::Error) -> Self {
        Self::Io(value)
    }
}