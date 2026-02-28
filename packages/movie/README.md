# movie

## 简介

`movie` 是一个独立 Rust CLI 工具，当前依赖 `reqwest`、`scraper`、`tokio`、`serde` 和 `clap`，适合做抓取、解析与命令行处理类任务。

## 目录

- `src/main.rs`：程序入口
- `src/fetch.rs`：抓取逻辑
- `src/parse.rs`：解析逻辑
- `src/query.rs`：查询逻辑
- `src/errors.rs`：错误定义

## 开发

在仓库根目录执行：

```bash
cargo run -p movie -- --help
cargo check -p movie
cargo test -p movie
```

## 修改建议

- 参数定义优先检查 `clap` 入口
- 网络抓取与解析改动时，保持错误类型和数据结构同步
- 若新增通用 Rust 能力，确认是否应抽到 `crates/*`

## 验证

```bash
cargo check -p movie
cargo test -p movie
```
