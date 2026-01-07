use serde::Serialize;
use tauri::{AppHandle, Runtime};

use crate::{
    adapter::{Adapter, InputItem, OpenAIAdapter, OpenAIStreamAdapter},
    errors::{ChatGPTError, ChatGPTResult},
};

use super::ChatGPTConfig;

pub(crate) struct AdapterPlugin;

impl<R: Runtime> tauri::plugin::Plugin<R> for AdapterPlugin {
    fn name(&self) -> &'static str {
        "adapter"
    }
    fn extend_api(&mut self, invoke: tauri::ipc::Invoke<R>) -> bool {
        let handle: Box<dyn Fn(tauri::ipc::Invoke<R>) -> bool + Send + Sync> =
            Box::new(tauri::generate_handler![
                get_all_adapter_setting_inputs,
                get_all_adapter_template_inputs,
                get_adapter_template_inputs
            ]);
        (handle)(invoke)
    }
}

#[derive(Debug, Clone, Serialize)]
struct SettingInputs {
    name: String,
    inputs: Vec<InputItem>,
}

impl<T: Adapter> From<T> for SettingInputs {
    fn from(value: T) -> Self {
        let name = T::NAME.to_string();
        let inputs = value.get_setting_inputs();
        SettingInputs { name, inputs }
    }
}

#[tauri::command]
fn get_all_adapter_setting_inputs() -> Vec<SettingInputs> {
    let openai = OpenAIAdapter.into();
    let openai_stream = OpenAIStreamAdapter.into();
    vec![openai, openai_stream]
}

#[derive(Debug, Clone, Serialize)]
struct TemplateInputs {
    name: String,
    inputs: Vec<InputItem>,
}

impl TemplateInputs {
    fn get_template_inputs<A: Adapter, R: Runtime>(
        app: &AppHandle<R>,
        adapter: A,
    ) -> ChatGPTResult<Self> {
        let config = ChatGPTConfig::get(app)?;
        let adapter_name = A::NAME;
        let settings = config.get_adapter_settings(adapter_name).ok_or(
            ChatGPTError::AdapterSettingsNotFound(adapter_name.to_string()),
        )?;
        let inputs = adapter.get_template_inputs(settings)?;
        Ok(TemplateInputs {
            name: adapter_name.to_string(),
            inputs,
        })
    }
}

#[tauri::command]
fn get_all_adapter_template_inputs<R: Runtime>(
    app: AppHandle<R>,
) -> ChatGPTResult<Vec<TemplateInputs>> {
    let openai = TemplateInputs::get_template_inputs(&app, OpenAIAdapter)?;
    let openai_stream = TemplateInputs::get_template_inputs(&app, OpenAIStreamAdapter)?;
    Ok(vec![openai, openai_stream])
}

#[tauri::command]
fn get_adapter_template_inputs<R: Runtime>(
    app: AppHandle<R>,
    adapter_name: String,
) -> ChatGPTResult<TemplateInputs> {
    match adapter_name.as_str() {
        OpenAIAdapter::NAME => TemplateInputs::get_template_inputs(&app, OpenAIAdapter),
        OpenAIStreamAdapter::NAME => TemplateInputs::get_template_inputs(&app, OpenAIStreamAdapter),
        _ => Err(ChatGPTError::AdapterNotFound(adapter_name)),
    }
}
