#[cfg(target_os = "macos")]
use crate::plugin::window::{FrontmostApp, restore_frontmost_app};
use crate::{
    clipboard::Clipboard,
    error::{ClipError, ClipResult},
    store::{self, DbConn, History},
};
use ciborium::into_writer;
use clipboard_rs::ClipboardWatcher;
use enigo::{Enigo, Key, Keyboard, Settings};
use serde_json::Value;
use tauri::{
    AppHandle, Manager, Runtime,
    ipc::{Invoke, Response},
};

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
            Box::new(tauri::generate_handler![query_history, copy_to_clipboard]);
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
    let conn = app.state::<DbConn>().get()?;
    let clip = Clipboard::new(conn)?;
    let mut watch = clip.init()?;
    let shutdown_channel = watch.get_shutdown_channel();
    std::thread::spawn(move || {
        watch.start_watch();
    });
    app.manage(shutdown_channel);
    Ok(())
}

#[tauri::command]
fn query_history(search_name: Option<String>, state: tauri::State<DbConn>) -> ClipResult<Response> {
    let mut conn = state.get()?;
    let data = History::query(search_name.as_ref().map(|data| data.as_bytes()), &mut conn)?;
    let mut bytes = Vec::new();
    into_writer(&data, &mut bytes)?;
    Ok(Response::new(bytes))
}

#[tauri::command]
fn copy_to_clipboard<R: Runtime>(id: i32, app_handle: AppHandle<R>) -> ClipResult<()> {
    // window
    if cfg!(target_os = "macos") {
        #[cfg(target_os = "macos")]
        {
            if let Some(prev_app) = app_handle.try_state::<FrontmostApp>() {
                let prev_app = prev_app.inner().lock().unwrap();
                restore_frontmost_app(&prev_app);
            }
        }
    } else if let Some(window) = app_handle.get_webview_window("main") {
        window.hide()?;
    }
    let mut conn = app_handle.state::<DbConn>().get()?;
    let history = History::find_by_id(id, &mut conn)?;
    Clipboard::write_to_clipboard(history.data)?;
    let mut enigo = Enigo::new(&Settings::default())?;
    enigo.key(
        if cfg!(target_os = "macos") {
            Key::Meta
        } else {
            Key::Control
        },
        enigo::Direction::Press,
    )?;
    enigo.key(Key::Unicode('v'), enigo::Direction::Click)?;
    enigo.key(
        if cfg!(target_os = "macos") {
            Key::Meta
        } else {
            Key::Control
        },
        enigo::Direction::Release,
    )?;
    Ok(())
}
