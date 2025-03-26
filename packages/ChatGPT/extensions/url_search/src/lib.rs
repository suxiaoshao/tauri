use chatgpt::extension::http_client::{HttpRequest, fetch};
use exports::chatgpt::extension::extension_api::{ChatRequest, ChatResponse, Guest};

wit_bindgen::generate!({
    // the name of the world in the `*.wit` input file
    world: "extension",
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
        if let Some(message) = request.messages.last_mut() {
            let req = HttpRequest {
                method: chatgpt::extension::http_client::HttpMethod::Get,
                url: message.content.clone(),
                headers: vec![],
                body: None,
                redirect_policy: chatgpt::extension::http_client::RedirectPolicy::FollowLimit(10),
            };
            let response = fetch(&req)?;
            let body = response.body;
            let text = String::from_utf8(body).map_err(|err| err.to_string())?;
            message.content = text;
        }
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
