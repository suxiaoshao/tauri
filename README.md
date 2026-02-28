# README.md

## 项目简介

这是一个基于 `pnpm workspace + Cargo workspace` 的多应用仓库，主要包含多个 `Tauri 2 + React 19 + TypeScript + Rsbuild` 桌面应用，以及两个独立 Rust CLI 工具。

当前主要应用：

- `packages/ChatGPT`：聊天应用
- `packages/Hclipboard`：剪贴板历史工具
- `packages/http-client`：HTTP 请求客户端
- `packages/feiwen`：小说抓取/整理工具
- `packages/movie`：Rust CLI 工具
- `packages/remove`：Rust CLI 工具

共享代码：

- `common/theme`
- `common/notify`
- `common/time`
- `common/types`
- `crates/delay`

## 技术栈

- 前端：`React 19`、`TypeScript`、`Rsbuild`
- 桌面端：`Tauri 2`
- UI：`Radix UI`、`shadcn/ui`、`tailwind-merge`、`class-variance-authority`
- Rust：`cargo workspace`
- 包管理：`pnpm`
- 测试：`Jest + jsdom`

## 快速开始

在仓库根目录执行：

```bash
pnpm install
pnpm run lint
pnpm run test
pnpm run build:web
cargo clippy --all
cargo test --all
```

## 常用命令

```bash
pnpm run format
pnpm run oxlint
pnpm run tslint
pnpm run build:web
pnpm run build:tauri
pnpm run test
```

单应用开发：

```bash
pnpm --filter ChatGPT tauri dev
pnpm --filter h-clipboard tauri dev
pnpm --filter http-client tauri dev
pnpm --filter feiwen tauri dev
```

独立 Rust 工具：

```bash
cargo run -p movie -- --help
cargo run -p remove -- --help
```

## 各应用入口

### ChatGPT

- 路径：`packages/ChatGPT`
- 前端开发端口：`1420`
- Tauri 配置：`packages/ChatGPT/src-tauri/tauri.conf.json`

### Hclipboard

- 路径：`packages/Hclipboard`
- 前端开发端口：`1420`
- Tauri 配置：`packages/Hclipboard/src-tauri/tauri.conf.json`

### http-client

- 路径：`packages/http-client`
- 前端开发端口：`5173`
- Tauri 配置：`packages/http-client/src-tauri/tauri.conf.json`

### feiwen

- 路径：`packages/feiwen`
- 前端开发端口：`3001`
- Tauri 配置：`packages/feiwen/src-tauri/tauri.conf.json`

### movie

- 路径：`packages/movie`
- 类型：Rust CLI

### remove

- 路径：`packages/remove`
- 类型：Rust CLI

## 文档入口

- Tauri start：`https://tauri.app/start/`
- Tauri plugins：`https://tauri.app/plugin/`
- Tauri config：`https://tauri.app/reference/config/`
- Tauri JavaScript API：`https://tauri.app/reference/javascript/api/`
- Tauri Rust API：`https://docs.rs/tauri/2.10.2/tauri/`
- shadcn/ui：`https://ui.shadcn.com/llms.txt`

## 修改后建议验证

- 前端改动：`pnpm run oxlint && pnpm run tslint`
- 前端测试相关：`pnpm run test`
- Rust 改动：`cargo check -p <pkg>`
- 影响面较大时：`pnpm run lint && pnpm run test && pnpm run build:web && cargo clippy --all && cargo test --all`
