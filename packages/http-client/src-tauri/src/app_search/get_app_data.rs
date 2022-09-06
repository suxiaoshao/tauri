use super::AppDataType;

#[cfg(target_os = "macos")]
pub fn get_app_data() -> Option<AppDataType> {
    super::macos::get_app_data()
}

#[cfg(target_os = "windows")]
pub fn get_app_data() -> Option<AppDataType> {
    super::win::get_app_data()
}
