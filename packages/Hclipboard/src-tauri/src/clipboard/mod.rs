/*
 * @Author: suxiaoshao 48886207+suxiaoshao@users.noreply.github.com
 * @Date: 2024-10-11 13:45:30
 * @LastEditors: suxiaoshao 48886207+suxiaoshao@users.noreply.github.com
 * @LastEditTime: 2025-02-07 01:46:30
 * @FilePath: /tauri/packages/Hclipboard/src-tauri/src/clipboard/mod.rs
 */
use crate::{
    error::{ClipError, ClipResult},
    store::{History, model::ClipboardType},
};
use ciborium::into_writer;
use clipboard_rs::{
    Clipboard as ClipboardTrait, ClipboardContext, ClipboardHandler, ClipboardWatcher,
    ClipboardWatcherContext, common::RustImage,
};
use diesel::{
    SqliteConnection,
    r2d2::{ConnectionManager, PooledConnection},
};
use log::warn;

type ClipConn = PooledConnection<ConnectionManager<SqliteConnection>>;

pub struct Clipboard {
    old_data: Vec<u8>,
    conn: ClipConn,
    ctx: ClipboardContext,
}

impl Clipboard {
    fn update(&mut self) -> ClipResult<()> {
        // text
        if self.ctx.has(clipboard_rs::ContentFormat::Text) {
            let text = self
                .ctx
                .get_text()
                .map_err(|err| ClipError::Clipboard(err.to_string()))?;
            if text.as_bytes() != self.old_data {
                #[cfg(debug_assertions)]
                println!("clipboard: {text}");
                History::insert(text.as_bytes(), ClipboardType::Text, &mut self.conn)?;
                self.old_data = text.as_bytes().to_vec();
            }
        }
        // image
        if self.ctx.has(clipboard_rs::ContentFormat::Image) {
            let image = self
                .ctx
                .get_image()
                .map_err(|err| ClipError::Clipboard(err.to_string()))?;
            let png = image
                .to_png()
                .map_err(|err| ClipError::Clipboard(err.to_string()))?;
            if png.get_bytes() != self.old_data {
                #[cfg(debug_assertions)]
                println!("clipboard: image");
                History::insert(png.get_bytes(), ClipboardType::Image, &mut self.conn)?;
                self.old_data = png.get_bytes().to_vec();
            }
        }
        // rtf
        if self.ctx.has(clipboard_rs::ContentFormat::Rtf) {
            let rtf = self
                .ctx
                .get_rich_text()
                .map_err(|err| ClipError::Clipboard(err.to_string()))?;
            if rtf.as_bytes() != self.old_data {
                #[cfg(debug_assertions)]
                println!("clipboard: rtf");
                History::insert(rtf.as_bytes(), ClipboardType::Rtf, &mut self.conn)?;
                self.old_data = rtf.as_bytes().to_vec();
            }
        }
        // html
        if self.ctx.has(clipboard_rs::ContentFormat::Html) {
            let html = self
                .ctx
                .get_html()
                .map_err(|err| ClipError::Clipboard(err.to_string()))?;
            if html.as_bytes() != self.old_data {
                #[cfg(debug_assertions)]
                println!("clipboard: html");
                History::insert(html.as_bytes(), ClipboardType::Html, &mut self.conn)?;
                self.old_data = html.as_bytes().to_vec();
            }
        }
        // files
        if self.ctx.has(clipboard_rs::ContentFormat::Files) {
            let files = self
                .ctx
                .get_files()
                .map_err(|err| ClipError::Clipboard(err.to_string()))?;
            let mut bytes = Vec::new();
            into_writer(&files, &mut bytes)?;
            if bytes != self.old_data {
                #[cfg(debug_assertions)]
                println!("clipboard: files");
                History::insert(&bytes, ClipboardType::Files, &mut self.conn)?;
                self.old_data = bytes;
            }
        }
        Ok(())
    }
    pub fn new(conn: ClipConn) -> ClipResult<Self> {
        let ctx = ClipboardContext::new().map_err(|err| ClipError::Clipboard(err.to_string()))?;
        Ok(Self {
            old_data: Vec::new(),
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
