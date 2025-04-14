use crate::{
    errors::{ChatGPTError, ChatGPTResult},
    extensions::{ExtensionConfig, ExtensionContainer},
};
use tauri::{Manager, Runtime, ipc::Invoke};
pub struct ExtensionsPlugin;

const EXTENSIONS_PATH: &str = "extensions";

impl<R: Runtime> tauri::plugin::Plugin<R> for ExtensionsPlugin {
    fn name(&self) -> &'static str {
        "extensions"
    }
    fn initialize(
        &mut self,
        app: &tauri::AppHandle<R>,
        _: serde_json::Value,
    ) -> Result<(), Box<dyn std::error::Error>> {
        setup(app)?;
        Ok(())
    }
    fn extend_api(&mut self, invoke: tauri::ipc::Invoke<R>) -> bool {
        let handle: Box<dyn Fn(Invoke<R>) -> bool + Send + Sync> =
            Box::new(tauri::generate_handler![get_all_extensions]);
        (handle)(invoke)
    }
}

fn setup<R: Runtime>(app: &tauri::AppHandle<R>) -> ChatGPTResult<()> {
    let extensions_path = extensions_path(app)?;
    let extension_container = ExtensionContainer::new(extensions_path)?;
    app.manage(extension_container);
    Ok(())
}

fn extensions_path<R: Runtime>(app: &tauri::AppHandle<R>) -> ChatGPTResult<std::path::PathBuf> {
    let file = app
        .path()
        .app_config_dir()
        .map_err(|_| ChatGPTError::DbPath)?
        .join(EXTENSIONS_PATH);
    if !file.exists() {
        std::fs::create_dir_all(&file)?;
    }
    Ok(file)
}

#[tauri::command]
fn get_all_extensions<R: Runtime>(app: tauri::AppHandle<R>) -> ChatGPTResult<Vec<ExtensionConfig>> {
    let extension_container = app.state::<ExtensionContainer>();
    Ok(extension_container.get_all_config())
}
