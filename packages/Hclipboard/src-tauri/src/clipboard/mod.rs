use clipboard_master::CallbackResult;
use diesel::{
    r2d2::{ConnectionManager, PooledConnection},
    SqliteConnection,
};
use log::warn;
use tauri::Runtime;
use tauri_plugin_clipboard_manager::Clipboard as ClipboardManager;

use crate::{error::ClipResult, store::History};

type ClipConn = PooledConnection<ConnectionManager<SqliteConnection>>;

pub struct Clipboard<'a, R: Runtime> {
    old_data: String,
    clip: &'a ClipboardManager<R>,
    conn: ClipConn,
}

impl<'a, R: Runtime> Clipboard<'a, R> {
    fn update(&mut self) -> ClipResult<()> {
        if let Ok(text) = self.clip.read_text() {
            if self.old_data != text {
                #[cfg(debug_assertions)]
                println!("clipboard: {}", text);
                History::insert(&text, &mut self.conn)?;
                self.old_data = text;
            }
        }
        Ok(())
    }
    pub fn new(clip: &'a ClipboardManager<R>, conn: ClipConn) -> Self {
        Self {
            old_data: String::new(),
            clip,
            conn,
        }
    }
    pub fn init(clip: &'a ClipboardManager<R>, conn: ClipConn) {
        let clip = Self::new(clip, conn);
        let _ = clipboard_master::Master::new(clip).run();
    }
}

impl<'a, R: Runtime> clipboard_master::ClipboardHandler for Clipboard<'a, R> {
    fn on_clipboard_change(&mut self) -> CallbackResult {
        if let Err(err) = self.update() {
            warn!("update clipboard error:{}", err)
        }
        CallbackResult::Next
    }
}
