# remove

## 简介

`remove` 是一个独立 Rust CLI 工具，当前依赖 `tokio`、`futures`、`clap` 和 `async-recursion`，适合处理异步文件系统或递归删除类任务。

## 目录

- `src/main.rs`：程序入口

## 开发

在仓库根目录执行：

```bash
cargo run -p remove -- --help
cargo check -p remove
cargo test -p remove
```

## 修改建议

- 优先保持 CLI 参数、异步流程和文件系统行为的一致性
- 涉及递归删除或批量文件操作时，先确认边界条件和错误处理
- 若增加高风险删除能力，应补充更明确的参数保护或日志

## 验证

```bash
cargo check -p remove
cargo test -p remove
```
