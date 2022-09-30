use clipboard_master::CallbackResult;
use tauri::ClipboardManager;

use crate::store::History;

pub struct Clipboard<T: ClipboardManager> {
    old_data: String,
    clip: T,
    url: String,
}

impl<T: ClipboardManager + Send + Sync + Sized> Clipboard<T> {
    fn update(&mut self) {
        if let Ok(Some(text)) = self.clip.read_text() {
            if self.old_data != text {
                let mut conn = super::store::establish_connection(&self.url);
                println!("clipboard: {}", text);
                History::insert(&text, &mut conn).unwrap();
                self.old_data = text;
            }
        }
    }
    pub fn new(clip: T, url: String) -> Self {
        Self {
            old_data: String::new(),
            clip,
            url,
        }
    }
    pub fn init<P: ToString>(clip: T, url: P) {
        let clip = Self::new(clip, url.to_string());
        let _ = clipboard_master::Master::new(clip).run();
    }
}

impl<T: ClipboardManager> clipboard_master::ClipboardHandler for Clipboard<T> {
    fn on_clipboard_change(&mut self) -> CallbackResult {
        self.update();
        CallbackResult::Next
    }
}
