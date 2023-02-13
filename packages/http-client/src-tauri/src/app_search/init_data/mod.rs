use super::AppDataType;
#[cfg(target_os = "macos")]
mod macos;
#[cfg(target_os = "windows")]
mod win;

#[cfg(target_os = "macos")]
pub fn get_app_data() -> Option<AppDataType> {
    macos::get_app_data()
}

#[cfg(target_os = "windows")]
pub fn get_app_data() -> Option<AppDataType> {
    win::get_app_data()
}

#[cfg(target_os = "linux")]
pub fn get_app_data() -> Option<AppDataType> {
    None
}
