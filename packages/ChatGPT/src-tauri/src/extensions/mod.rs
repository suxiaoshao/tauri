use wasmtime::component::*;
use wasmtime_wasi::{IoView, WasiCtx, WasiView};

bindgen!({
    world: "host",
    path:"../extensions/wit",
});

struct ExtensionState {
    table: ResourceTable,
    wasi: WasiCtx,
}

impl IoView for ExtensionState {
    fn table(&mut self) -> &mut ResourceTable {
        &mut self.table
    }
}
impl WasiView for ExtensionState {
    fn ctx(&mut self) -> &mut WasiCtx {
        &mut self.wasi
    }
}

impl Host_Imports for ExtensionState {
    fn get_selected_text(&mut self) -> Result<String, String> {
        todo!()
    }
}

#[cfg(test)]
mod tests {
    use wasmtime::{Engine, Store};
    use wasmtime_wasi::WasiCtx;

    use crate::extensions::exports::extension::host::extension_api::{ChatRequest, Message};

    use super::{exports::extension::host::extension_api::Role, *};

    #[test]
    fn test_extension() -> anyhow::Result<()> {
        let engine = Engine::default();
        let component = Component::from_file(&engine, std::env::var("WASM_PATH")?)?;
        let mut linker = Linker::new(&engine);
        wasmtime_wasi::add_to_linker_sync(&mut linker)?;
        Host_::add_to_linker(&mut linker, |state: &mut ExtensionState| state)?;
        let mut store = Store::new(
            &engine,
            ExtensionState {
                table: ResourceTable::new(),
                wasi: WasiCtx::builder().build(),
            },
        );
        let bindings = Host_::instantiate(&mut store, &component, &linker)?;
        let extension_api = bindings.extension_host_extension_api();
        let name = extension_api.call_get_name(&mut store)?;
        assert_eq!(name, "url_search");
        let chat_request = ChatRequest {
            messages: vec![Message {
                role: Role::User,
                content: "https://baidu.com".to_string(),
            }],
        };
        let response = extension_api.call_on_request(&mut store, &chat_request)?;
        assert!(response.is_ok());
        println!("{:?}", response);
        Ok(())
    }
}
