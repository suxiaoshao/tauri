use std::{collections::HashMap, path::PathBuf};

use walkdir::{DirEntry, WalkDir};

use super::{AppDataType, AppPath};

static PATH: &'static str = "/Applications";
pub fn get_app_data() -> Option<AppDataType> {
    let mut map = HashMap::new();
    let path = PathBuf::from(PATH);
    search_by_path(&path);

    Some(map)
}

fn search_by_path(path: &PathBuf) -> Vec<AppPath> {
    WalkDir::new(path)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(filter_app)
        .for_each(|x| {
            println!("{}", x.path().display());
        });
    todo!()
}

fn filter_app(dir: &DirEntry) -> bool {
    dir.path().extension().map(|x| x == "app").unwrap_or(false)
}

#[cfg(test)]
mod test {
    use super::get_app_data;

    #[test]
    fn test_app_search() {
        get_app_data();
    }
}
