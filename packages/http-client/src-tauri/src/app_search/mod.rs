mod get_app_data;
use once_cell::sync::Lazy;
use serde::Serialize;
use std::sync::Mutex;
use std::{collections::HashMap, path::PathBuf};

#[derive(Debug, Serialize, Clone)]
pub struct AppPath {
    desc: Option<String>,
    icon: Option<PathBuf>,
    path: PathBuf,
    name: String,
}
impl PartialEq<&str> for &AppPath {
    fn eq(&self, path: &&str) -> bool {
        let name = self.name.to_ascii_lowercase();
        let path = path.to_ascii_lowercase();
        name.contains(&path) && !path.is_empty()
    }
}

pub type AppDataType = HashMap<PathBuf, AppPath>;

pub static APP_DATA: Lazy<Mutex<AppDataType>> = Lazy::new(|| {
    let m = HashMap::new();
    Mutex::new(m)
});

pub fn app_data_init() -> Option<()> {
    let data = get_app_data::get_app_data()?;
    *APP_DATA.lock().unwrap() = data;
    Some(())
}

pub fn query_app_data(path: &str) -> Vec<AppPath> {
    let data = APP_DATA
        .lock()
        .unwrap()
        .values()
        .cloned()
        .filter(|x| x == path)
        .collect::<Vec<_>>();
    data
}
