mod fetch;
mod parse;
mod errors;

use crate::parse::parse_page;
use crate::errors::MovieResult;
use crate::fetch::fetch_all;

#[tokio::main]
async fn main() -> MovieResult<()> {
    fetch_all().await?;
    Ok(())
}
