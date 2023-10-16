use serde_json::Value;
use tauri::{AppHandle, Manager, Runtime};

use crate::{
    errors::{FeiwenError, FeiwenResult},
    store,
};

pub struct StorePlugin;

impl<R: Runtime> tauri::plugin::Plugin<R> for StorePlugin {
    fn name(&self) -> &'static str {
        "chat"
    }
    fn initialize(&mut self, app: &AppHandle<R>, _: Value) -> tauri::plugin::Result<()> {
        setup(app)?;
        Ok(())
    }
}

fn setup<R: Runtime>(app: &AppHandle<R>) -> FeiwenResult<()> {
    use tauri::api::path::*;
    //data path
    let data_path = app_config_dir(&app.config())
        .ok_or(FeiwenError::DbPath)?
        .join("data.sqlite")
        .to_str()
        .ok_or(FeiwenError::DbPath)?
        .to_string();
    // database connection
    let conn = store::establish_connection(&data_path)?;
    app.manage(conn);
    Ok(())
}
