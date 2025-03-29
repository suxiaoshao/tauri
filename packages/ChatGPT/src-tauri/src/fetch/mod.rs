/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-15 20:42:50
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/fetch/mod.rs
 */
pub use self::types::{ChatRequest, Message, OpenAIStreamResponse};
use crate::{
    adapter::{Adapter, OpenAIAdapter, OpenAIStreamAdapter},
    errors::{ChatGPTError, ChatGPTResult},
    extensions::{Extension, ExtensionState},
    plugins::ChatGPTConfig,
};
use futures::pin_mut;
use serde_json::Value;
use wasmtime::Store;

mod types;

pub trait FetchRunner {
    fn get_adapter(&self) -> &str;
    fn get_template(&self) -> &Value;
    fn get_config(&self) -> &ChatGPTConfig;
    fn get_history(&self) -> Vec<Message>;
    fn fetch(
        &self,
        extension: Option<(Extension, Store<ExtensionState>)>,
    ) -> impl futures::Stream<Item = ChatGPTResult<String>> {
        fn get_adapter_not_found(adapter: &str) -> ChatGPTResult<()> {
            Err(ChatGPTError::AdapterNotFound(adapter.to_string()))
        }
        async fn get_history(
            origin_history: Vec<Message>,
            extension: Option<(Extension, Store<ExtensionState>)>,
        ) -> ChatGPTResult<Vec<Message>> {
            if let Some((extension, mut store)) = extension {
                let chat_request = origin_history.into();
                let extension_api = extension.chatgpt_extension_extension_api();
                let data = extension_api
                    .call_on_request(&mut store, &chat_request)
                    .await
                    .map_err(|_| ChatGPTError::ExtensionRuntimeError)?
                    .map_err(|_| ChatGPTError::ExtensionRuntimeError)?;
                return Ok(data.into());
            }
            Ok(origin_history)
        }
        async_stream::try_stream! {
            let adapter = self.get_adapter();
            let config = self.get_config();
            let settings = config
                .get_adapter_settings(adapter)
                .ok_or(ChatGPTError::AdapterSettingsNotFound(adapter.to_string()))?;
            match adapter {
                OpenAIAdapter::NAME => {
                    let adapter = OpenAIAdapter;
                    let stream = adapter.fetch(
                        config,
                        settings,
                        self.get_template(),
                        get_history(self.get_history(),extension).await?,
                    );
                     pin_mut!(stream);
                     for await item in stream {
                         yield item?;
                     }
                },
                OpenAIStreamAdapter::NAME => {
                    let adapter = OpenAIStreamAdapter;
                    let stream = adapter.fetch(
                        config,
                        settings,
                        self.get_template(),
                        get_history(self.get_history(),extension).await?,
                    );
                     pin_mut!(stream);
                     for await item in stream {
                         yield item?;
                     }
                },
                _ => get_adapter_not_found(adapter)?
            };
        }
    }
}
