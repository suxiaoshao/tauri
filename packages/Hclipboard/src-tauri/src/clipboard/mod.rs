/*
 * @Author: suxiaoshao 48886207+suxiaoshao@users.noreply.github.com
 * @Date: 2024-10-11 13:45:30
 * @LastEditors: suxiaoshao 48886207+suxiaoshao@users.noreply.github.com
 * @LastEditTime: 2025-02-07 01:46:30
 * @FilePath: /tauri/packages/Hclipboard/src-tauri/src/clipboard/mod.rs
 */
use crate::{
    error::{ClipError, ClipResult},
    store::{History, HistoryData},
};
use clipboard_rs::{
    Clipboard as ClipboardTrait, ClipboardContent, ClipboardContext, ClipboardHandler,
    ClipboardWatcher, ClipboardWatcherContext, RustImageData, common::RustImage,
};
use diesel::{
    SqliteConnection,
    r2d2::{ConnectionManager, PooledConnection},
};
use log::warn;
use unicode_segmentation::UnicodeSegmentation;

type ClipConn = PooledConnection<ConnectionManager<SqliteConnection>>;

fn get_text_info(text: &str) -> Result<(usize, usize), ClipError> {
    let char_count = text.graphemes(true).count();
    let word_count = text.unicode_words().count();
    Ok((char_count, word_count))
}

pub struct Clipboard {
    old_data: HistoryData,
    conn: ClipConn,
    ctx: ClipboardContext,
}

impl Clipboard {
    fn update(&mut self) -> ClipResult<()> {
        // image
        if self.ctx.has(clipboard_rs::ContentFormat::Image) {
            let image = self
                .ctx
                .get_image()
                .map_err(|err| ClipError::Clipboard(err.to_string()))?;
            let png = image
                .to_png()
                .map_err(|err| ClipError::Clipboard(err.to_string()))?;
            let (width, height) = image.get_size();
            let size = png.get_bytes().len();
            let history_data = HistoryData::Image {
                data: png.get_bytes().to_vec(),
                width,
                height,
                size,
            };
            if history_data != self.old_data {
                // todo log
                #[cfg(debug_assertions)]
                println!("clipboard image");
                History::insert_or_update(&history_data, &mut self.conn)?;
                self.old_data = history_data;
            }
        }
        // files
        if self.ctx.has(clipboard_rs::ContentFormat::Files) {
            let files = self
                .ctx
                .get_files()
                .map_err(|err| ClipError::Clipboard(err.to_string()))?;
            let history_data = HistoryData::Files(files);
            if history_data != self.old_data {
                #[cfg(debug_assertions)]
                println!("clipboard files : {history_data:?}");
                History::insert_or_update(&history_data, &mut self.conn)?;
                self.old_data = history_data;
            }
        }
        // rtf
        if self.ctx.has(clipboard_rs::ContentFormat::Rtf) {
            let rtf = self
                .ctx
                .get_rich_text()
                .map_err(|err| ClipError::Clipboard(err.to_string()))?;
            let plain_text = self
                .ctx
                .get_text()
                .map_err(|err| ClipError::Clipboard(err.to_string()))?;
            let (char_count, word_count) = get_text_info(&rtf)?;
            let history_data = HistoryData::Rtf {
                text: rtf,
                plain_text,
                char_count,
                word_count,
            };
            if history_data != self.old_data {
                #[cfg(debug_assertions)]
                println!("clipboard rtf : {history_data:?}");
                History::insert_or_update(&history_data, &mut self.conn)?;
                self.old_data = history_data;
            }
            return Ok(());
        }
        // html
        if self.ctx.has(clipboard_rs::ContentFormat::Html) {
            let html = self
                .ctx
                .get_html()
                .map_err(|err| ClipError::Clipboard(err.to_string()))?;
            let plain_text = self
                .ctx
                .get_text()
                .map_err(|err| ClipError::Clipboard(err.to_string()))?;
            let (char_count, word_count) = get_text_info(&html)?;
            let history_data = HistoryData::Html {
                text: html,
                plain_text,
                word_count,
                char_count,
            };
            if history_data != self.old_data {
                #[cfg(debug_assertions)]
                println!("clipboard html : {history_data:?}");
                History::insert_or_update(&history_data, &mut self.conn)?;
                self.old_data = history_data;
            }
            return Ok(());
        }
        // text
        if self.ctx.has(clipboard_rs::ContentFormat::Text) {
            let text = self
                .ctx
                .get_text()
                .map_err(|err| ClipError::Clipboard(err.to_string()))?;
            let (char_count, word_count) = get_text_info(&text)?;
            let history_data = HistoryData::Text {
                text,
                word_count,
                char_count,
            };
            if history_data != self.old_data {
                #[cfg(debug_assertions)]
                println!("clipboard text: {history_data:?}");
                History::insert_or_update(&history_data, &mut self.conn)?;
                self.old_data = history_data;
            }
            return Ok(());
        }
        Ok(())
    }
    pub fn new(conn: ClipConn) -> ClipResult<Self> {
        let ctx = ClipboardContext::new().map_err(|err| ClipError::Clipboard(err.to_string()))?;
        Ok(Self {
            old_data: HistoryData::Text {
                text: "".to_string(),
                word_count: 0,
                char_count: 0,
            },
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
    pub fn write_to_clipboard(data: HistoryData) -> ClipResult<()> {
        let ctx = ClipboardContext::new().map_err(|err| ClipError::Clipboard(err.to_string()))?;
        let data = match data {
            HistoryData::Text { text, .. } => ctx.set_text(text),
            HistoryData::Image { data, .. } => {
                let image = RustImageData::from_bytes(data.as_slice())
                    .map_err(|err| ClipError::Clipboard(err.to_string()))?;
                ctx.set_image(image)
            }
            HistoryData::Files(items) => ctx.set_files(items),
            HistoryData::Rtf {
                text, plain_text, ..
            } => ctx.set(vec![
                ClipboardContent::Rtf(text),
                ClipboardContent::Text(plain_text),
            ]),
            HistoryData::Html {
                text, plain_text, ..
            } => ctx.set(vec![
                ClipboardContent::Html(text),
                ClipboardContent::Text(plain_text),
            ]),
        };
        data.map_err(|err| ClipError::Clipboard(err.to_string()))
    }
}
impl ClipboardHandler for Clipboard {
    fn on_clipboard_change(&mut self) {
        if let Err(err) = self.update() {
            warn!("update clipboard error:{err}")
        }
    }
}
