use serde_json::Value;
use tauri::{AppHandle, Invoke, Manager, Runtime, State};

use crate::{
    errors::{FeiwenError, FeiwenResult},
    store::{self, service::Tag, DbConn},
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
            Box::new(tauri::generate_handler![fetch::fetch, get_tags]);
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
#[tauri::command(async)]
async fn get_tags(
    state: State<'_, DbConn>,
    page: Option<i64>,
    page_size: Option<i64>,
) -> FeiwenResult<Vec<Tag>> {
    let page = page.unwrap_or(1);
    let page_size = page_size.unwrap_or(50);
    let offset = (page - 1) * page_size;
    let conn = &mut state.get()?;
    Tag::tags(offset, page_size, conn)
}
