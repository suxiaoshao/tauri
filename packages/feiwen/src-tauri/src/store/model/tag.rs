use crate::{errors::FeiwenResult, fetch::parse_novel::parse_url::UrlWithName};

use super::super::schema::tag;
use diesel::prelude::*;
#[derive(Queryable, Insertable, Debug)]
#[diesel(table_name = tag)]
pub struct TagModel {
    pub href: String,
    pub name: String,
}

impl TagModel {
    pub fn all_tags(conn: &mut SqliteConnection) -> FeiwenResult<Vec<String>> {
        let data = tag::table.select(tag::name).load::<String>(conn)?;
        Ok(data)
    }
}

impl From<&UrlWithName> for TagModel {
    fn from(value: &UrlWithName) -> Self {
        Self {
            href: value.href.clone(),
            name: value.name.clone(),
        }
    }
}
