use crate::errors::{ChatGPTError, ChatGPTResult};
use component::{Extension, ExtensionState};
use std::{collections::HashMap, path::PathBuf};
use wasmtime::{Config, Engine, component::*};

mod component;

const WASM_FILE_NAME: &str = "extension.wasm";
const CONFIG_FILE_NAME: &str = "config.toml";

#[derive(Debug, Clone, serde::Deserialize)]
struct ExtensionConfig {
    name: String,
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
) -> ChatGPTResult<HashMap<String, Component>> {
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
            map.insert(config.name, component);
        }
    }
    Ok(map)
}

pub(crate) struct ExtensionContainer {
    engine: Engine,
    component_map: HashMap<String, Component>,
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
}
