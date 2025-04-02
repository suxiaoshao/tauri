use crate::plugins::ChatGPTConfig;
use chatgpt::extension::http_client::{HttpRequest, HttpResponse};
pub use exports::chatgpt::extension::extension_api::ChatRequest;
use reqwest::{header::HeaderValue, redirect::Policy};
use std::str::FromStr;
use wasmtime::component::*;
use wasmtime_wasi::{IoView, WasiCtx, WasiView};

bindgen!({
    world: "extension",
    path:"../extensions/wit",
    async: true
});

pub(crate) struct ExtensionState {
    table: ResourceTable,
    wasi: WasiCtx,
    app_config: ChatGPTConfig,
}

impl ExtensionState {
    pub(super) fn new(app_config: ChatGPTConfig) -> Self {
        Self {
            table: ResourceTable::new(),
            wasi: WasiCtx::builder().build(),
            app_config,
        }
    }
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

impl ExtensionImports for ExtensionState {
    async fn get_selected_text(&mut self) -> Result<String, String> {
        get_selected_text::get_selected_text().map_err(|err| err.to_string())
    }
}

impl chatgpt::extension::http_client::Host for ExtensionState {
    async fn fetch(
        &mut self,
        HttpRequest {
            headers,
            body,
            method,
            redirect_policy,
            url,
        }: HttpRequest,
    ) -> Result<HttpResponse, String> {
        // redirect
        let mut client = reqwest::Client::builder().redirect(match redirect_policy {
            chatgpt::extension::http_client::RedirectPolicy::NoFollow => Policy::none(),
            chatgpt::extension::http_client::RedirectPolicy::FollowLimit(time) => {
                Policy::limited(time as usize)
            }
            chatgpt::extension::http_client::RedirectPolicy::FollowAll => {
                Policy::custom(|attempt| attempt.follow())
            }
        });

        // proxy
        match self.app_config.get_http_proxy() {
            None => {}
            Some(proxy) => {
                client = client.proxy(reqwest::Proxy::all(proxy).map_err(|err| err.to_string())?);
            }
        }

        // headers
        let mut reqwest_headers = reqwest::header::HeaderMap::new();
        for (key, value) in headers.iter() {
            let header_name =
                reqwest::header::HeaderName::from_str(key).map_err(|err| err.to_string())?;
            reqwest_headers.append(
                header_name,
                HeaderValue::from_str(value).map_err(|err| err.to_string())?,
            );
        }
        let client = client
            .default_headers(reqwest_headers)
            .build()
            .map_err(|err| err.to_string())?;

        // method
        let mut request = match method {
            chatgpt::extension::http_client::HttpMethod::Get => client.get(url),
            chatgpt::extension::http_client::HttpMethod::Head => client.head(url),
            chatgpt::extension::http_client::HttpMethod::Post => client.post(url),
            chatgpt::extension::http_client::HttpMethod::Put => client.put(url),
            chatgpt::extension::http_client::HttpMethod::Delete => client.delete(url),
            chatgpt::extension::http_client::HttpMethod::Patch => client.patch(url),
        };

        // body
        if let Some(body) = body {
            request = request.body(body);
        }

        // send
        let response = request.send().await.map_err(|err| err.to_string())?;
        let response_headers = response.headers();
        let mut headers = vec![];
        for (header_name, header_value) in response_headers {
            headers.push((
                header_name.as_str().to_string(),
                header_value
                    .to_str()
                    .map_err(|err| err.to_string())?
                    .to_string(),
            ));
        }
        let body = response
            .bytes()
            .await
            .map_err(|err| err.to_string())?
            .into();
        Ok(HttpResponse { headers, body })
    }
}

#[cfg(test)]
mod tests {
    use super::exports::chatgpt::extension::extension_api::ChatRequest;
    use super::*;
    use anyhow::anyhow;
    use wasmtime::{Config, Engine, Store};

    #[tokio::test]
    async fn test_extension() -> anyhow::Result<()> {
        let mut config = Config::new();
        config.async_support(true);
        let engine = Engine::new(&config)?;
        let component = Component::from_binary(&engine, include_bytes!("../../url_search.wasm"))?;
        let mut linker = Linker::new(&engine);
        wasmtime_wasi::add_to_linker_async(&mut linker)?;
        Extension::add_to_linker(&mut linker, |state: &mut ExtensionState| state)?;
        let mut store = Store::new(&engine, ExtensionState::new(ChatGPTConfig::default()));
        let bindings = Extension::instantiate_async(&mut store, &component, &linker).await?;
        let extension_api = bindings.chatgpt_extension_extension_api();
        let chat_request = ChatRequest {
            message: "https://baidu.com".to_string(),
        };
        let response = extension_api
            .call_on_request(&mut store, &chat_request)
            .await?;
        assert!(response.is_ok());
        let response = response.map_err(|err| anyhow!("{}", err))?;
        println!("{:?}", response);
        Ok(())
    }
}
