use crate::fetch::parse_novel::{parse_url::UrlWithName, Novel};
use anyhow::Ok;
use diesel::{
    r2d2::{ConnectionManager, Pool},
    QueryDsl, RunQueryDsl, SqliteConnection,
};
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
type SqlitePool = Pool<ConnectionManager<SqliteConnection>>;

pub fn get_conn() -> anyhow::Result<SqlitePool> {
    let path = get_data_path()?;
    let path = path.to_str().ok_or_else(|| anyhow::anyhow!("路径错误"))?;
    let manager = ConnectionManager::<SqliteConnection>::new(path);
    // Refer to the `r2d2` documentation for more methods to use
    // when building a connection pool
    let pool = Pool::builder().test_on_check_out(true).build(manager)?;
    Ok(pool)
}

pub struct StoreManager {
    conn: SqlitePool,
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
        let conn = &mut self.conn.get()?;
        diesel::insert_or_ignore_into(novel::table)
            .values(&data)
            .execute(conn)?;
        diesel::insert_or_ignore_into(tag::table)
            .values(&tags)
            .execute(conn)?;
        diesel::insert_or_ignore_into(novel_tag::table)
            .values(&novel_tags)
            .execute(conn)?;
        Ok(())
    }
    pub fn len(&self) -> anyhow::Result<i64> {
        use schema::novel::dsl::*;
        let conn = &mut self.conn.get()?;
        let data = novel.count().get_result(conn)?;
        Ok(data)
    }
}
