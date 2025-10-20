/*
 * @Author: suxiaoshao 48886207+suxiaoshao@users.noreply.github.com
 * @Date: 2024-10-11 13:45:30
 * @LastEditors: suxiaoshao 48886207+suxiaoshao@users.noreply.github.com
 * @LastEditTime: 2025-02-07 01:46:30
 * @FilePath: /tauri/packages/Hclipboard/src-tauri/src/clipboard/mod.rs
 */
use clipboard_rs::{
    Clipboard as ClipboardTrait, ClipboardContext, ClipboardHandler, ClipboardWatcher,
    ClipboardWatcherContext,
};
use diesel::{
    SqliteConnection,
    r2d2::{ConnectionManager, PooledConnection},
};
use log::warn;

use crate::{
    error::{ClipError, ClipResult},
    store::History,
};

type ClipConn = PooledConnection<ConnectionManager<SqliteConnection>>;

pub struct Clipboard {
    old_data: String,
    conn: ClipConn,
    ctx: ClipboardContext,
}

impl Clipboard {
    fn update(&mut self) -> ClipResult<()> {
        if let Ok(text) = self.ctx.get_text()
            && self.old_data != text
        {
            #[cfg(debug_assertions)]
            println!("clipboard: {text}");
            History::insert(&text, &mut self.conn)?;
            self.old_data = text;
        }
        Ok(())
    }
    pub fn new(conn: ClipConn) -> ClipResult<Self> {
        let ctx = ClipboardContext::new().map_err(|err| ClipError::Clipboard(err.to_string()))?;
        Ok(Self {
            old_data: String::new(),
            conn,
            ctx,
        })
    }
    pub fn init(self) -> ClipResult<ClipboardWatcherContext<Clipboard>> {
        let mut watcher =
            ClipboardWatcherContext::new().map_err(|err| ClipError::Clipboard(err.to_string()))?;
        watcher.add_handler(self);
        Ok(watcher)
    }
}
impl ClipboardHandler for Clipboard {
    fn on_clipboard_change(&mut self) {
        if let Err(err) = self.update() {
            warn!("update clipboard error:{err}")
        }
    }
}
