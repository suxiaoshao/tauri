use diesel::SqliteConnection;
use serde::{Deserialize, Serialize};

use crate::{errors::FeiwenResult, store::model::TagModel};

#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq, Hash)]
pub struct Tag {
    pub name: String,
    pub id: Option<i32>,
}

impl From<TagModel> for Tag {
    fn from(value: TagModel) -> Self {
        Self {
            name: value.name,
            id: value.id,
        }
    }
}

impl Tag {
    pub fn tags(offset: i64, limit: i64, conn: &mut SqliteConnection) -> FeiwenResult<Vec<Self>> {
        let tags = TagModel::all_tags(offset, limit, conn)?;
        let tags = tags
            .into_iter()
            .map(|tag| tag.into())
            .collect::<Vec<Self>>();
        Ok(tags)
    }
}
