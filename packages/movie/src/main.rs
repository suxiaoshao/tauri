mod errors;
mod fetch;
mod parse;
mod query;

use crate::errors::MovieResult;
use crate::fetch::fetch_all;
use crate::parse::parse_page;
use clap::{Args, Parser, Subcommand, ValueEnum};
use parse::Movie;

#[derive(Parser)]
#[clap(author, about, long_about = None)]
#[clap(propagate_version = true)]
struct Cli {
    #[clap(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Adds files to myapp
    Fetch,
    Query(Query),
}

#[derive(Args)]
pub(crate) struct Query {
    /// 标签
    #[clap(short, long, action)]
    tags: Vec<String>,
    /// 是否全选标签
    #[clap(short, long, default_value = "true")]
    all_tags: bool,
    /// 根据排序
    #[clap(short, long, value_enum, default_value = "year")]
    order_by: OrderBy,
    /// 排序方式
    #[clap(short, long, default_value = "true")]
    desc: bool,
}

#[derive(Copy, Clone, PartialEq, Eq, PartialOrd, Ord, ValueEnum, Debug)]
enum OrderBy {
    Year,
}

#[tokio::main]
async fn main() -> MovieResult<()> {
    let cli = Cli::parse();
    match cli.command {
        Commands::Fetch => {
            println!("fetching...");
            fetch_all().await?;
        }
        Commands::Query(args) => {
            let movies = query::query(args).await?;
            movies.into_iter().for_each(|Movie { name, year, .. }| {
                let name = name
                    .into_iter()
                    .next()
                    .unwrap_or_else(|| "未命名".to_string());
                println!("{name}:{year}");
            })
        }
    }
    Ok(())
}
