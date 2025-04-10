use crate::{
    error::{ClipError, ClipResult},
    store::{self, DbConn, History},
};
use serde_json::Value;
use tauri::{ipc::Invoke, AppHandle, Manager, Runtime};
use tauri_plugin_clipboard_manager::ClipboardExt;
#[tauri::command]
fn query_history(
    search_name: Option<String>,
    state: tauri::State<DbConn>,
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
            Box::new(tauri::generate_handler![query_history]);
        (handle)(invoke)
    }
}

fn setup<R: Runtime>(app: &AppHandle<R>) -> ClipResult<()> {
    //data path
    let data_path = app
        .path()
        .app_config_dir()
        .map_err(|_| ClipError::DbPath)?
        .join("clipboard.sqlite3")
        .to_str()
        .ok_or(ClipError::DbPath)?
        .to_string();
    // database connection
    let conn = store::establish_connection(&data_path)?;
    app.manage(conn);

    let app2 = app.clone();
    let conn = app.state::<DbConn>().get()?;
    std::thread::spawn(move || {
        let clip = app2.clipboard();
        crate::clipboard::Clipboard::init(clip, conn);
    });
    Ok(())
}
