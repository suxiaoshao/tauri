use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Title {
    pub name: String,
    pub id: i32,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub enum Author {
    Anonymous(String),
    Known(Title),
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct NovelCount {
    pub word_count: i32,
    pub read_count: i32,
    pub reply_count: i32,
}

#[derive(Debug, Deserialize, Serialize, Clone, Hash, Eq, PartialEq)]
pub struct UrlWithName {
    pub name: String,
    pub href: String,
}
