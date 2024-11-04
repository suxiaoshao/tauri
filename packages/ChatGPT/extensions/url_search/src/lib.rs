use exports::extension::host::extension_api::{ChatRequest, ChatResponse, Guest};

wit_bindgen::generate!({
    // the name of the world in the `*.wit` input file
    world: "host",
    pub_export_macro: true,
    path:"../wit"
});
struct MyHost;

impl Guest for MyHost {
    fn on_request(request: ChatRequest) -> Result<ChatRequest, String> {
        todo!()
    }

    fn on_response(response: ChatResponse) -> Result<ChatResponse, String> {
        todo!()
    }
    fn get_name() -> String {
        "url_search".to_string()
    }
}

export!(MyHost);
