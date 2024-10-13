use super::AppDataType;
#[cfg(target_os = "macos")]
mod macos;
#[cfg(target_os = "windows")]
mod win;
use tauri::{AppHandle, Runtime};

#[cfg(target_os = "macos")]
pub fn get_app_data<R: Runtime>(_app: &AppHandle<R>) -> Option<AppDataType> {
    macos::get_app_data()
}

#[cfg(target_os = "windows")]
pub fn get_app_data<R: Runtime>(app: &AppHandle<R>) -> Option<AppDataType> {
    win::get_app_data(app)
}

#[cfg(target_os = "linux")]
pub fn get_app_data<R: Runtime>(_app: &AppHandle<R>) -> Option<AppDataType> {
    None
}
