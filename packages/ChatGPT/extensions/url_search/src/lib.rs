use exports::extension::host::extension_api::{ChatRequest, ChatResponse, Guest};
mod errors;

wit_bindgen::generate!({
    // the name of the world in the `*.wit` input file
    world: "host",
    pub_export_macro: true,
    path:"../wit",
    async: {
        exports:[
            "extension:host/extension-api#on-request",
            "extension:host/extension-api#on-response"
        ]
    }
});
struct UrlSearch;

impl Guest for UrlSearch {
    async fn on_request(mut request: ChatRequest) -> Result<ChatRequest, String> {
        if let Some(message) = request.messages.last_mut() {
            let response = reqwest::get(message.content.trim())
                .await
                .map_err(|err| err.to_string())?;
            let text = response.text().await.map_err(|err| err.to_string())?;
            message.content = text;
        }
        Ok(request)
    }

    async fn on_response(response: ChatResponse) -> Result<ChatResponse, String> {
        Ok(response)
    }
    fn get_name() -> String {
        "url_search".to_string()
    }
}

export!(UrlSearch);
