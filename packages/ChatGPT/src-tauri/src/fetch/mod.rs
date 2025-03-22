/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-15 20:42:50
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/fetch/mod.rs
 */
use serde_json::Value;

use futures::pin_mut;

use crate::{
    adapter::{Adapter, OpenAIAdapter, OpenAIStreamAdapter},
    errors::{ChatGPTError, ChatGPTResult},
    plugins::ChatGPTConfig,
};

pub use self::types::{ChatRequest, ChatResponse, Message};

mod types;

pub trait FetchRunner {
    fn get_adapter(&self) -> &str;
    fn get_template(&self) -> &Value;
    fn get_config(&self) -> &ChatGPTConfig;
    fn get_history(&self) -> Vec<Message>;
    fn fetch(&self) -> impl futures::Stream<Item = ChatGPTResult<String>> {
        fn get_adapter_not_found(adapter: &str) -> ChatGPTResult<()> {
            Err(ChatGPTError::AdapterNotFound(adapter.to_string()))
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
                        settings,
                        self.get_template(),
                        self.get_history(),
                    );
                     pin_mut!(stream);
                     for await item in stream {
                         yield item?;
                     }
                },
                OpenAIStreamAdapter::NAME => {
                    let adapter = OpenAIStreamAdapter;
                    let stream = adapter.fetch(
                        settings,
                        self.get_template(),
                        self.get_history(),
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
