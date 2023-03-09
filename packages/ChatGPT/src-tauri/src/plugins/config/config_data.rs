use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
pub struct ChatGPTConfig {
    api_key: Option<String>,
}
