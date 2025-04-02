use crate::{
    errors::{ChatGPTError, ChatGPTResult},
    plugins::ChatGPTConfig,
};
use std::{collections::HashMap, path::PathBuf};
use tauri::{AppHandle, Manager, Runtime};
use wasmtime::{Config, Engine, Store, component::*};
mod component;

pub(crate) use component::{ChatRequest, Extension, ExtensionState};

const WASM_FILE_NAME: &str = "extension.wasm";
const CONFIG_FILE_NAME: &str = "config.toml";

#[derive(Debug, Clone, serde::Deserialize)]
pub(crate) struct ExtensionConfig {
    pub(crate) name: String,
    pub(crate) icon: Option<String>,
    pub(crate) description: Option<String>,
}

impl ExtensionConfig {
    fn load(config_path: PathBuf) -> ChatGPTResult<Self> {
        let config = std::fs::read_to_string(config_path)?;
        let data = toml::from_str(&config)?;
        Ok(data)
    }
}

fn initialize_wasmtime_engine() -> ChatGPTResult<Engine> {
    let mut config = Config::new();
    config.async_support(true);
    let engine = Engine::new(&config).map_err(|_err| ChatGPTError::WasmtimeEngineCreationFailed)?;
    Ok(engine)
}

fn get_all_components(
    engine: &Engine,
    extensions_path: PathBuf,
) -> ChatGPTResult<HashMap<String, (Component, ExtensionConfig)>> {
    let mut map = HashMap::new();
    for entry in std::fs::read_dir(extensions_path)? {
        let entry = entry?;
        let path = entry.path();
        if path.is_dir() {
            let wasm_path = path.join(WASM_FILE_NAME);
            let config_path = path.join(CONFIG_FILE_NAME);
            let config = ExtensionConfig::load(config_path)?;
            let component = Component::from_file(engine, &wasm_path)
                .map_err(|_| ChatGPTError::WasmtimeComponentCreationFailed(wasm_path))?;
            map.insert(config.name.clone(), (component, config));
        }
    }
    Ok(map)
}

pub(crate) struct ExtensionContainer {
    engine: Engine,
    component_map: HashMap<String, (Component, ExtensionConfig)>,
    linker: Linker<ExtensionState>,
}

impl ExtensionContainer {
    pub(crate) fn new(extensions_path: PathBuf) -> ChatGPTResult<Self> {
        // engine
        let engine = initialize_wasmtime_engine()?;
        let component_map = get_all_components(&engine, extensions_path)?;

        // linker
        let mut linker = Linker::new(&engine);
        wasmtime_wasi::add_to_linker_async(&mut linker).map_err(|_| ChatGPTError::WasmtimeError)?;
        Extension::add_to_linker(&mut linker, |state: &mut ExtensionState| state)
            .map_err(|_| ChatGPTError::WasmtimeError)?;
        Ok(Self {
            engine,
            component_map,
            linker,
        })
    }
    pub(crate) fn load_from_app<R: Runtime>(app_handle: &AppHandle<R>) -> ChatGPTResult<&Self> {
        let extension_container = app_handle.state::<Self>();
        Ok(extension_container.inner())
    }
    pub(crate) async fn get_extension<R: Runtime>(
        &self,
        name: &str,
        app_handle: &AppHandle<R>,
    ) -> ChatGPTResult<ExtensionRunner> {
        let (component, extension_config) = self
            .component_map
            .get(name)
            .ok_or(ChatGPTError::ExtensionNotFound(name.to_string()))?;
        let config = ChatGPTConfig::get(app_handle)?;
        let mut store = Store::new(&self.engine, ExtensionState::new(config));
        let bindings = Extension::instantiate_async(&mut store, component, &self.linker)
            .await
            .map_err(|_| ChatGPTError::ExtensionError(name.to_string()))?;
        Ok(ExtensionRunner {
            extension: bindings,
            store,
            config: extension_config.clone(),
        })
    }
}

pub(crate) struct ExtensionRunner {
    pub(crate) extension: Extension,
    pub(crate) store: Store<ExtensionState>,
    pub(crate) config: ExtensionConfig,
}
