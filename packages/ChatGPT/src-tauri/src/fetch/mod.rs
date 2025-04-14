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
    extensions::ExtensionRunner,
    plugins::ChatGPTConfig,
    store::Content,
};
use futures::pin_mut;
use serde_json::Value;

mod types;

pub trait FetchRunner {
    fn get_adapter(&self) -> &str;
    fn get_template(&self) -> &Value;
    fn get_config(&self) -> &ChatGPTConfig;
    fn get_history(&self) -> Vec<Message>;
    async fn get_new_user_content(
        send_content: String,
        extension: Option<ExtensionRunner>,
    ) -> ChatGPTResult<Content> {
        if let Some(ExtensionRunner {
            extension,
            mut store,
            config,
        }) = extension
        {
            let chat_request = crate::extensions::ChatRequest {
                message: send_content.clone(),
            };
            let extension_api = extension.chatgpt_extension_extension_api();
            let data = extension_api
                .call_on_request(&mut store, &chat_request)
                .await
                .map_err(|_| ChatGPTError::ExtensionRuntimeError)?
                .map_err(|_| ChatGPTError::ExtensionRuntimeError)?;
            return Ok(Content::Extension {
                source: send_content,
                extension_name: config.name,
                content: data.message,
            });
        }
        Ok(Content::Text(send_content))
    }
    fn fetch(&self) -> impl futures::Stream<Item = ChatGPTResult<String>> {
        async_stream::try_stream! {
            let adapter = self.get_adapter();
            let config = self.get_config();
            let settings = config
                .get_adapter_settings(adapter)
                .ok_or(ChatGPTError::AdapterSettingsNotFound(adapter.to_string()))?;
            let history = self.get_history();
            match adapter {
                OpenAIAdapter::NAME => {
                    let adapter = OpenAIAdapter;
                    let stream = adapter.fetch(
                        config,
                        settings,
                        self.get_template(),
                        history,
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
                        history,
                    );
                    pin_mut!(stream);
                    for await item in stream {
                        yield item?;
                    }
                },
                _ => Err(ChatGPTError::AdapterNotFound(adapter.to_string()))?
            };
        }
    }
}
