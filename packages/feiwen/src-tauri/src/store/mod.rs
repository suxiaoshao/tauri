use crate::fetch::parse_novel::{parse_url::UrlWithName, Novel};
use anyhow::Ok;
use diesel::{Connection, QueryDsl, RunQueryDsl, SqliteConnection};
use std::path::PathBuf;

use self::model::NovelTagModel;

pub mod model;
pub mod schema;

pub fn get_data_path() -> anyhow::Result<PathBuf> {
    let path = tauri::api::path::data_dir().ok_or_else(|| anyhow::anyhow!("获取路径错误"))?;
    std::fs::create_dir_all(&path)?;
    let path = path.join("feiwen/data.sqlite");
    Ok(path)
}

pub fn get_conn() -> anyhow::Result<SqliteConnection> {
    let path = get_data_path()?;
    let path = path.to_str().ok_or_else(|| anyhow::anyhow!("路径错误"))?;
    let conn = SqliteConnection::establish(path)?;
    Ok(conn)
}

pub struct StoreManager {
    conn: SqliteConnection,
}

impl StoreManager {
    pub fn new() -> anyhow::Result<Self> {
        let conn = get_conn()?;
        Ok(Self { conn })
    }
    pub fn add_novels(&self, novels: Vec<Novel>) -> anyhow::Result<()> {
        for data in novels {
            self.add_novel(data)?;
        }
        Ok(())
    }
    fn add_novel(&self, data: Novel) -> anyhow::Result<()> {
        use schema::novel;
        use schema::novel_tag;
        use schema::tag;
        let tags = data
            .tags
            .iter()
            .map(|tag| tag.into())
            .collect::<Vec<crate::store::model::TagModel>>();
        let novel_tags = data
            .tags
            .iter()
            .map(|UrlWithName { name, .. }| NovelTagModel {
                novel_id: data.title.id as i32,
                tag_id: name.clone(),
            })
            .collect::<Vec<NovelTagModel>>();
        let data: model::NovelModel = data.into();
        diesel::insert_or_ignore_into(novel::table)
            .values(&data)
            .execute(&self.conn)?;
        diesel::insert_or_ignore_into(tag::table)
            .values(&tags)
            .execute(&self.conn)?;
        diesel::insert_or_ignore_into(novel_tag::table)
            .values(&novel_tags)
            .execute(&self.conn)?;
        Ok(())
    }
    pub fn len(&self) -> anyhow::Result<i64> {
        use schema::novel::dsl::*;
        let data = novel.count().get_result(&self.conn)?;
        Ok(data)
    }
}
