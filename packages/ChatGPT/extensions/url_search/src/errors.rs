#[derive(thiserror::Error, Debug)]
pub enum UrlSearchError {
    #[error("failed to get response")]
    Reqwest(#[from] reqwest::Error),
}
