use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq, Hash)]
pub struct Tag {
    pub name: String,
    pub id: Option<i64>,
}
