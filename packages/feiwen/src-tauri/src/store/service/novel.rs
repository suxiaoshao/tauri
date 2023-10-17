use std::collections::HashSet;

use diesel::SqliteConnection;
use serde::{Deserialize, Serialize};

use crate::{
    errors::{FeiwenError, FeiwenResult},
    store::{
        model::{NovelModel, NovelTagModel, TagModel},
        types::{Author, NovelCount, Title, UrlWithName},
    },
};

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Novel {
    pub title: Title,
    pub author: Author,
    pub latest_chapter: Title,
    pub desc: String,
    pub count: NovelCount,
    pub tags: HashSet<UrlWithName>,
    pub is_limit: bool,
}

impl Novel {
    pub fn save(self, conn: &mut SqliteConnection) -> FeiwenResult<()> {
        let tags = self
            .tags
            .iter()
            .map(|tag| tag.into())
            .collect::<Vec<TagModel>>();
        let novel_tags = self
            .tags
            .iter()
            .map(|UrlWithName { name, .. }| NovelTagModel {
                novel_id: self.title.id,
                tag_id: name.clone(),
            })
            .collect::<Vec<NovelTagModel>>();
        let novel = NovelModel::from(self);
        conn.immediate_transaction::<_, FeiwenError, _>(|conn| {
            novel.save(conn)?;
            TagModel::save(tags, conn)?;
            NovelTagModel::save(novel_tags, conn)?;
            Ok(())
        })?;
        Ok(())
    }
    pub fn count(conn: &mut SqliteConnection) -> FeiwenResult<i64> {
        NovelModel::count(conn)
    }
}
