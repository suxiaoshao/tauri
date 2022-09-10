use once_cell::sync::Lazy;
use pinyin::ToPinyin;
use serde::Serialize;
use std::sync::Mutex;
use std::{collections::HashMap, path::PathBuf};

#[derive(Debug, Serialize, Clone)]
pub struct AppPath {
    pub desc: Option<String>,
    pub icon: Option<PathBuf>,
    pub path: PathBuf,
    pub name: String,
}
impl PartialEq<&str> for &AppPath {
    fn eq(&self, path: &&str) -> bool {
        let name = self.name.to_ascii_lowercase();
        let path = path.to_ascii_lowercase();
        let chinese_name = self
            .name
            .chars()
            .map(|x| x.to_pinyin().map(|x| x.plain()))
            .fold(Some("".to_string()), |acc, x| match (acc, x) {
                (Some(a), Some(b)) => Some(a + b),
                _ => None,
            })
            .unwrap_or_default();
        (name.contains(&path) || chinese_name.contains(&path)) && !path.is_empty()
    }
}

pub type AppDataType = HashMap<PathBuf, AppPath>;

pub static APP_DATA: Lazy<Mutex<AppDataType>> = Lazy::new(|| {
    let m = HashMap::new();
    Mutex::new(m)
});
