use chatgpt::extension::http_client::{HttpRequest, fetch};
use exports::chatgpt::extension::extension_api::{ChatRequest, ChatResponse, Guest};
use visdom::Vis;

wit_bindgen::generate!({
    // the name of the world in the `*.wit` input file
    world: "extension",
    path:"../wit",
    // async: {
    //     exports:[
    //         // todo async
    //         // "extension:host/extension-api#on-request"
    //     ]
    // }
});

struct UrlSearch;

impl Guest for UrlSearch {
    fn on_request(mut request: ChatRequest) -> Result<ChatRequest, String> {
        let req = HttpRequest {
            method: chatgpt::extension::http_client::HttpMethod::Get,
            url: request.message.clone(),
            headers: vec![],
            body: None,
            redirect_policy: chatgpt::extension::http_client::RedirectPolicy::FollowLimit(10),
        };
        let response = fetch(&req)?;
        let body = response.body;
        let text = String::from_utf8(body).map_err(|err| err.to_string())?;
        request.message = remove_some(text)?;
        Ok(request)
    }

    fn on_response(response: ChatResponse) -> Result<ChatResponse, String> {
        Ok(ChatResponse {
            message: response.message,
        })
    }
}

fn remove_some(html: String) -> Result<String, String> {
    let dom = Vis::load(html).map_err(|err| err.to_string())?;
    dom.find("script, style, link, meta, svg").remove();
    dom.find("*:not(code)").remove_attr("class");
    Ok(dom.html())
}

export!(UrlSearch);
