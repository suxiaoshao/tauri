use serde_json::Value;
use tauri::{AppHandle, Manager, Runtime, State, ipc::Invoke};

use crate::{
    errors::{FeiwenError, FeiwenResult},
    store::{self, DbConn, service::Tag},
};
mod fetch;

pub struct StorePlugin;

impl<R: Runtime> tauri::plugin::Plugin<R> for StorePlugin {
    fn name(&self) -> &'static str {
        "store"
    }
    fn initialize(
        &mut self,
        app: &AppHandle<R>,
        _: Value,
    ) -> Result<(), Box<dyn std::error::Error>> {
        setup(app)?;
        Ok(())
    }
    fn extend_api(&mut self, invoke: Invoke<R>) -> bool {
        let handle: Box<dyn Fn(Invoke<R>) -> bool + Send + Sync> =
            Box::new(tauri::generate_handler![fetch::fetch, get_tags]);
        (handle)(invoke)
    }
}

fn setup<R: Runtime>(app: &AppHandle<R>) -> FeiwenResult<()> {
    //data path
    let data_path = app
        .path()
        .app_config_dir()
        .map_err(|_| FeiwenError::DbPath)?
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
