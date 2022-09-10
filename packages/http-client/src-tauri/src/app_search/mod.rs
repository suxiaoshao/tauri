mod init_data;

use self::app_data::APP_DATA;
pub use app_data::{AppDataType, AppPath};
mod app_data;

pub fn app_data_init() -> Option<()> {
    let data = init_data::get_app_data()?;
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
