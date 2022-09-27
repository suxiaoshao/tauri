use clipboard_master::CallbackResult;
use tauri::ClipboardManager;

pub struct Clipboard<T: ClipboardManager> {
    old_data: String,
    clip: T,
}

impl<T: ClipboardManager + Send + Sync> Clipboard<T> {
    fn update(&mut self) {
        if let Ok(Some(text)) = self.clip.read_text() {
            if self.old_data != text {
                println!("clipboard: {}", text);
                self.old_data = text;
            }
        }
    }
    pub fn new(clip: T) -> Self {
        Self {
            old_data: String::new(),
            clip,
        }
    }
    pub fn init(clip: T) {
        let clip = Self::new(clip);
        let _ = clipboard_master::Master::new(clip).run();
    }
}

impl<T: ClipboardManager> clipboard_master::ClipboardHandler for Clipboard<T> {
    fn on_clipboard_change(&mut self) -> CallbackResult {
        self.update();
        CallbackResult::Next
    }
}
