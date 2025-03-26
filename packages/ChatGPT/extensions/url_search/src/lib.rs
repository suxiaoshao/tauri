use exports::extension::host::extension_api::{ChatRequest, ChatResponse, Guest};

wit_bindgen::generate!({
    // the name of the world in the `*.wit` input file
    world: "host",
    path:"../wit",
    async: {
        exports:[
            // todo async
            // "extension:host/extension-api#on-request"
        ]
    }
});
struct UrlSearch;

impl Guest for UrlSearch {
    fn on_request(mut request: ChatRequest) -> Result<ChatRequest, String> {
        Ok(request)
    }

    fn on_response(response: ChatResponse) -> Result<ChatResponse, String> {
        Ok(ChatResponse {
            message: response.message,
        })
    }
    fn get_name() -> String {
        "url_search".to_string()
    }
}

export!(UrlSearch);
