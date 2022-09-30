use clipboard_master::CallbackResult;
use diesel::{
    r2d2::{ConnectionManager, PooledConnection},
    SqliteConnection,
};
use tauri::ClipboardManager;

use crate::{error::ClipResult, store::History};

type ClipConn = PooledConnection<ConnectionManager<SqliteConnection>>;

pub struct Clipboard<T: ClipboardManager> {
    old_data: String,
    clip: T,
    conn: ClipConn,
}

impl<T: ClipboardManager + Send + Sync + Sized> Clipboard<T> {
    fn update(&mut self) -> ClipResult<()> {
        if let Ok(Some(text)) = self.clip.read_text() {
            if self.old_data != text {
                println!("clipboard: {}", text);
                History::insert(&text, &mut self.conn)?;
                self.old_data = text;
            }
        }
        Ok(())
    }
    pub fn new(clip: T, conn: ClipConn) -> Self {
        Self {
            old_data: String::new(),
            clip,
            conn,
        }
    }
    pub fn init(clip: T, conn: ClipConn) {
        let clip = Self::new(clip, conn);
        let _ = clipboard_master::Master::new(clip).run();
    }
}

impl<T: ClipboardManager> clipboard_master::ClipboardHandler for Clipboard<T> {
    fn on_clipboard_change(&mut self) -> CallbackResult {
        self.update();
        CallbackResult::Next
    }
}
