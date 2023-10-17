use serde_json::Value;
use tauri::{AppHandle, Invoke, Manager, Runtime};

use crate::{
    errors::{FeiwenError, FeiwenResult},
    store,
};
mod fetch;

pub struct StorePlugin;

impl<R: Runtime> tauri::plugin::Plugin<R> for StorePlugin {
    fn name(&self) -> &'static str {
        "store"
    }
    fn initialize(&mut self, app: &AppHandle<R>, _: Value) -> tauri::plugin::Result<()> {
        setup(app)?;
        Ok(())
    }
    fn extend_api(&mut self, invoke: Invoke<R>) {
        let handle: Box<dyn Fn(Invoke<R>) + Send + Sync> =
            Box::new(tauri::generate_handler![fetch::fetch,]);
        (handle)(invoke);
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
