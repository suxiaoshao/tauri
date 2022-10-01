use tauri::{
    plugin::{Builder, TauriPlugin},
    AppHandle, Manager, Runtime,
};

use crate::{
    error::{ClipError, ClipResult},
    store::{self, DbConn},
};

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("clipboard")
        .setup(|x| {
            setup(x)?;
            Ok(())
        })
        .build()
}

fn setup<R: Runtime>(app: &AppHandle<R>) -> ClipResult<()> {
    println!("clip setup");
    use tauri::api::path::*;
    //data path
    let data_path = app_dir(&app.config())
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
