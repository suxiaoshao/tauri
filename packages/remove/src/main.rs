extern crate core;

use async_recursion::async_recursion;
use clap::Parser;
use std::path::PathBuf;
use tokio::fs::{self, DirEntry};

/// 递归这个目录下所有文件夹
#[async_recursion(?Send)]
async fn match_all(
    path: PathBuf,
    match_name: &[String],
    exclude: &[String],
) -> std::io::Result<()> {
    let mut dir = fs::read_dir(path).await?;
    let mut future_vec = vec![];
    while let Some(x) = dir.next_entry().await? {
        future_vec.push(match1(x, match_name, exclude));
    }
    futures::future::join_all(future_vec).await;
    Ok(())
}

/// 查看这个文件夹是否是待删除的文件夹,如果是就删除,不是往下递归
async fn match1(x: DirEntry, match_name: &[String], exclude: &[String]) -> std::io::Result<()> {
    let file_name = x.file_name().to_str().unwrap_or("").to_string();
    let file_type = x.file_type().await?;
    if exclude.contains(&file_name) && file_type.is_dir() {
    } else if match_name.contains(&file_name) && file_type.is_dir() {
        println!("deleting {}", x.path().display());
        fs::remove_dir_all(x.path()).await?;
    } else if file_type.is_dir() {
        match_all(x.path(), match_name, exclude).await?;
    }
    Ok(())
}

#[derive(Parser, Debug)]
#[clap(author, about, long_about = None)]
struct Args {
    #[clap(help = "删除的匹配文件夹名", value_parser)]
    match_name: Vec<String>,
    /// Name of the person to greet
    #[clap(short, long, default_value = ".", help = "寻找的路径")]
    pub path: String,
    #[clap(short, long, help = "排除的路径")]
    pub exclude: Vec<String>,
}

#[tokio::main]
async fn main() -> tokio::io::Result<()> {
    let args = Args::parse();
    match_all(PathBuf::from(args.path), &args.match_name, &args.exclude).await?;
    Ok(())
}
