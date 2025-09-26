/*
 * @Author: suxiaoshao suxiaoshao@gamil.com
 * @Date: 2022-09-11 02:49:00
 * @LastEditors: suxiaoshao suxiaoshao@gamil.com
 * @LastEditTime: 2025-09-11 15:21:13
 * @FilePath: \tauri\packages\http-client\src-tauri\src\app_search\init_data\win.rs
 */
use std::{
    collections::HashMap,
    path::{Path, PathBuf},
};

use lnk::{ShellLink, encoding::WINDOWS_1252};
use tauri::{AppHandle, Manager, Runtime};
use walkdir::{DirEntry, WalkDir};

use crate::app_search::AppPath;

use super::AppDataType;

pub fn get_app_data<R: Runtime>(app: &AppHandle<R>) -> Option<AppDataType> {
    let path = app.path().data_dir().ok()?;
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
    let name = dir
        .path()
        .file_name()?
        .to_str()?
        .split('.')
        .next()?
        .to_string();
    let data = ShellLink::open(dir.path(), WINDOWS_1252).ok()?;
    let data = data.string_data();
    let desc = data.name_string().clone();
    let icon = data.icon_location().as_ref().map(PathBuf::from);
    let path = data.relative_path().as_ref().map(PathBuf::from)?;
    let path = push_path(dir.path(), &path);
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
