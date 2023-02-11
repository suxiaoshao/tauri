use crate::parse::Movie;
use crate::{parse_page, MovieResult};
use reqwest::Client;

pub(crate) static PATH: &str = "C:/Users/Administrator/Downloads";

async fn fetch_one(client: &Client, start: u32) -> MovieResult<Vec<Movie>> {
    let url = "https://movie.douban.com/top250?filter=";
    let body = client
        .get(url)
        .query(&[("start", start)])
        .send()
        .await?
        .text()
        .await?;
    let movie = parse_page(body)?;
    Ok(movie)
}

pub(crate) async fn fetch_all() -> MovieResult<()> {
    let client = Client::new();
    let mut movies = Vec::new();
    for i in 0..10 {
        print!("fetching page {i}");
        let movie = fetch_one(&client, i * 25).await?;
        movies.extend(movie);
        let data = serde_json::to_string(&movies)?;
        tokio::fs::write(format!("{PATH}/data.json"), data).await?;
    }
    Ok(())
}
