use std::collections::HashSet;

use crate::{errors::MovieResult, fetch::PATH, parse::Movie, OrderBy, Query};

pub(crate) async fn query(
    Query {
        tags,
        all_tags,
        order_by,
        desc,
    }: Query,
) -> MovieResult<Vec<Movie>> {
    let movies = get_data().await?;
    let match_tags: HashSet<String> = tags.into_iter().collect();
    let mut movies = match all_tags {
        true => movies
            .into_iter()
            .filter(|Movie { tags, .. }| tags.is_superset(&match_tags))
            .collect::<Vec<_>>(),
        false => movies
            .into_iter()
            .filter(|Movie { tags, .. }| !tags.is_disjoint(&match_tags))
            .collect(),
    };
    movies.sort_by(|x, y| match order_by {
        OrderBy::Year => {
            if desc {
                y.year.cmp(&x.year)
            } else {
                x.year.cmp(&y.year)
            }
        }
    });

    Ok(movies)
}

async fn get_data() -> MovieResult<Vec<Movie>> {
    let data = tokio::fs::read_to_string(format!("{PATH}/data.json")).await?;
    let movies = serde_json::from_str(&data)?;
    Ok(movies)
}
