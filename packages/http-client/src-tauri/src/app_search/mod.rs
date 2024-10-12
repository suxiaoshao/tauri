/*
 * @Author: suxiaoshao suxiaoshao@gamil.com
 * @Date: 2022-09-11 02:49:00
 * @LastEditors: suxiaoshao suxiaoshao@gamil.com
 * @LastEditTime: 2023-12-19 00:21:33
 * @FilePath: \tauri\packages\http-client\src-tauri\src\app_search\mod.rs
 */
mod init_data;

use self::app_data::APP_DATA;
pub use app_data::{AppDataType, AppPath};
use tauri::{AppHandle, Runtime};
mod app_data;

pub fn app_data_init<R: Runtime>(app: &AppHandle<R>) -> Option<()> {
    let data = init_data::get_app_data(app)?;
    *APP_DATA.lock().unwrap() = data;
    Some(())
}

pub fn query_app_data(path: &str) -> Vec<AppPath> {
    let data = APP_DATA
        .lock()
        .unwrap()
        .values()
        .filter(|&x| x == path)
        .cloned()
        .collect::<Vec<_>>();
    data
}
