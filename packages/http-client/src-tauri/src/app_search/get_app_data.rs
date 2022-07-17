use std::{
    collections::HashMap,
    path::{Path, PathBuf},
};

use lnk::ShellLink;
use tauri::api::path::data_dir;
use walkdir::{DirEntry, WalkDir};

use super::{AppDataType, AppPath};

pub fn get_app_data() -> Option<AppDataType> {
    let path = data_dir()?;
    let path = path.join("Microsoft/Windows/Start Menu/Programs");
    let mut map = HashMap::new();
    search_by_path(&path).into_iter().for_each(|app| {
        map.insert(app.path.clone(), app);
    });
    let path = PathBuf::from("C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs");

    search_by_path(&path).into_iter().for_each(|app| {
        map.insert(app.path.clone(), app);
    });
    Some(map)
}

fn search_by_path(path: &PathBuf) -> Vec<AppPath> {
    WalkDir::new(path)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(filter_lnk)
        .filter_map(map_lnk)
        .collect()
}

fn filter_lnk(path: &DirEntry) -> bool {
    path.file_type().is_file() && path.path().extension().and_then(|x| x.to_str()) == Some("lnk")
}

fn map_lnk(dir: DirEntry) -> Option<AppPath> {
    let data = ShellLink::open(dir.path()).ok()?;
    let desc = data.name().clone();
    let icon = data.icon_location().as_ref().map(PathBuf::from);
    let path = data.relative_path().as_ref().map(PathBuf::from)?;
    let path = push_path(dir.path(), &path);
    let name = path.iter().last()?.to_str()?.to_string();
    Some(AppPath {
        desc,
        icon,
        path,
        name,
    })
}

fn push_path(origin_path: &Path, path: &Path) -> PathBuf {
    let mut result = origin_path.join("");
    result.pop();
    for i in path.iter() {
        match i.to_str() {
            Some("..") => {
                result.pop();
            }
            _ => result.push(i),
        }
    }
    result
}

#[cfg(test)]
mod test {
    use super::get_app_data;

    #[test]
    fn test_app_search() {
        get_app_data();
    }
}
