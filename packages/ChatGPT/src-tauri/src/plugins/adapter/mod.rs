use serde::Serialize;
use tauri::Runtime;

use crate::adapter::{Adapter, InputItem, OpenAIAdapter, OpenAIStreamAdapter};

pub(crate) struct AdapterPlugin;

impl<R: Runtime> tauri::plugin::Plugin<R> for AdapterPlugin {
    fn name(&self) -> &'static str {
        "adapter"
    }
    fn extend_api(&mut self, invoke: tauri::ipc::Invoke<R>) -> bool {
        let handle: Box<dyn Fn(tauri::ipc::Invoke<R>) -> bool + Send + Sync> =
            Box::new(tauri::generate_handler![get_adapter_setting_inputs]);
        (handle)(invoke)
    }
}

#[derive(Debug, Clone, Serialize)]
struct Inputs {
    name: String,
    inputs: Vec<InputItem>,
}

impl<T: Adapter> From<T> for Inputs {
    fn from(value: T) -> Self {
        let name = <T as Adapter>::NAME.to_string();
        let inputs = value.get_setting_inputs();
        Inputs { name, inputs }
    }
}

#[tauri::command]
fn get_adapter_setting_inputs() -> Vec<Inputs> {
    let openai = OpenAIAdapter.into();
    let openai_stream = OpenAIStreamAdapter.into();
    vec![openai, openai_stream]
}
