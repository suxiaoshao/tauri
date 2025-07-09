use std::{collections::HashMap, path::PathBuf};

use walkdir::{DirEntry, WalkDir};

use crate::app_search::AppPath;

use super::AppDataType;

static PATH: &str = "/Applications";
pub fn get_app_data() -> Option<AppDataType> {
    let mut map = HashMap::new();
    let path = PathBuf::from(PATH);
    search_by_path(&path, &mut map);

    Some(map)
}

fn search_by_path(path: &PathBuf, map: &mut HashMap<PathBuf, AppPath>) {
    let mut it = WalkDir::new(path).into_iter();
    loop {
        let entry = match it.next() {
            None => break,
            Some(Err(_)) => continue,
            Some(Ok(entry)) => entry,
        };
        if filter_app(&entry) {
            it.skip_current_dir();
            let app = map_app(&entry);
            if let Some(app) = app {
                map.insert(app.path.clone(), app);
            }
        }
    }
}

fn map_app(entry: &DirEntry) -> Option<AppPath> {
    let path = entry.path().to_path_buf();
    let name = path
        .file_name()
        .unwrap()
        .to_str()
        .unwrap()
        .to_string()
        .replace(".app", "");
    let desc = None;
    let icon = None;
    Some(AppPath {
        desc,
        icon,
        path,
        name,
    })
}

fn filter_app(dir: &DirEntry) -> bool {
    dir.path().extension().map(|x| x == "app").unwrap_or(false)
}

#[cfg(test)]
mod test {
    use super::get_app_data;

    #[test]
    fn test_app_search() {
        let data = get_app_data();
        println!("{data:#?}");
    }
}
