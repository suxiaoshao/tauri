use std::str::FromStr;

use chatgpt::extension::http_client::{HttpRequest, HttpResponse};
use reqwest::{header::HeaderValue, redirect::Policy};
use wasmtime::component::*;
use wasmtime_wasi::{IoView, WasiCtx, WasiView};

bindgen!({
    world: "extension",
    path:"../extensions/wit",
    async: true
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
        let client = reqwest::Client::builder().redirect(match redirect_policy {
            chatgpt::extension::http_client::RedirectPolicy::NoFollow => Policy::none(),
            chatgpt::extension::http_client::RedirectPolicy::FollowLimit(time) => {
                Policy::limited(time as usize)
            }
            chatgpt::extension::http_client::RedirectPolicy::FollowAll => {
                Policy::custom(|attempt| attempt.follow())
            }
        });
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
        let mut request = match method {
            chatgpt::extension::http_client::HttpMethod::Get => client.get(url),
            chatgpt::extension::http_client::HttpMethod::Head => client.head(url),
            chatgpt::extension::http_client::HttpMethod::Post => client.post(url),
            chatgpt::extension::http_client::HttpMethod::Put => client.put(url),
            chatgpt::extension::http_client::HttpMethod::Delete => client.delete(url),
            chatgpt::extension::http_client::HttpMethod::Patch => client.patch(url),
        };
        if let Some(body) = body {
            request = request.body(body);
        }
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
    use wasmtime::{Config, Engine, Store};
    use wasmtime_wasi::WasiCtx;

    use crate::extensions::exports::chatgpt::extension::extension_api::{ChatRequest, Message};

    use super::{exports::chatgpt::extension::extension_api::Role, *};

    #[tokio::test]
    async fn test_extension() -> anyhow::Result<()> {
        let mut config = Config::new();
        config.async_support(true);
        let engine = Engine::new(&config)?;
        let component = Component::from_file(&engine, std::env::var("WASM_PATH")?)?;
        let mut linker = Linker::new(&engine);
        wasmtime_wasi::add_to_linker_async(&mut linker)?;
        Extension::add_to_linker(&mut linker, |state: &mut ExtensionState| state)?;
        let mut store = Store::new(
            &engine,
            ExtensionState {
                table: ResourceTable::new(),
                wasi: WasiCtx::builder().build(),
            },
        );
        let bindings = Extension::instantiate_async(&mut store, &component, &linker).await?;
        let extension_api = bindings.chatgpt_extension_extension_api();
        let name = extension_api.call_get_name(&mut store).await?;
        assert_eq!(name, "url_search");
        let chat_request = ChatRequest {
            messages: vec![Message {
                role: Role::User,
                content: "https://baidu.com".to_string(),
            }],
        };
        let response = extension_api
            .call_on_request(&mut store, &chat_request)
            .await?;
        assert!(response.is_ok());
        println!("{:?}", response);
        Ok(())
    }
}
