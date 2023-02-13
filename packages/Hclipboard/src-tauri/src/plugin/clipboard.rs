use crate::{
    error::{ClipError, ClipResult},
    store::{self, DbConn, History},
};
use serde_json::Value;
use tauri::{AppHandle, Invoke, Manager, Runtime};
#[tauri::command(async)]
fn query_history(
    search_name: Option<String>,
    state: tauri::State<'_, DbConn>,
) -> ClipResult<Vec<History>> {
    let mut conn = state.get()?;
    let data = History::query(search_name.as_ref(), &mut conn)?;
    Ok(data)
}

pub struct ClipboardPlugin;

impl<R: Runtime> tauri::plugin::Plugin<R> for ClipboardPlugin {
    fn name(&self) -> &'static str {
        "clipboard"
    }
    fn initialize(&mut self, app: &AppHandle<R>, _: Value) -> tauri::plugin::Result<()> {
        setup(app)?;
        Ok(())
    }
    fn extend_api(&mut self, invoke: Invoke<R>) {
        let handle: Box<dyn Fn(Invoke<R>) + Send + Sync> =
            Box::new(tauri::generate_handler![query_history]);
        (handle)(invoke);
    }
}

fn setup<R: Runtime>(app: &AppHandle<R>) -> ClipResult<()> {
    use tauri::api::path::*;
    //data path
    let data_path = app_config_dir(&app.config())
        .ok_or(ClipError::DbPath)?
        .join("clipboard.sqlite3")
        .to_str()
        .ok_or(ClipError::DbPath)?
        .to_string();
    // database connection
    let conn = store::establish_connection(&data_path)?;
    app.manage(conn);
    let clip = app.clipboard_manager();
    let conn = app.state::<DbConn>().get()?;
    std::thread::spawn(|| {
        crate::clipboard::Clipboard::init(clip, conn);
    });
    Ok(())
}
