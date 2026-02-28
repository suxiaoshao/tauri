# http-client

## 简介

`http-client` 是一个基于 Tauri 的 HTTP 请求客户端，包含请求构造、页面展示、窗口与托盘能力，并使用 Tauri shell 插件。

## 目录

- `src/`：请求页面、组件、核心请求逻辑
- `src-tauri/`：插件、托盘、窗口、应用搜索等后端逻辑
- `components.json`：`shadcn/ui` 配置
- `rsbuild.config.ts`：前端构建配置

## 开发

在仓库根目录执行：

```bash
pnpm --filter http-client dev
pnpm --filter http-client build
pnpm --filter http-client tauri dev
pnpm --filter http-client tauri build
```

## 关键事实

- 前端开发端口：`5173`
- 产品名：`http client`
- Tauri 配置：`src-tauri/tauri.conf.json`
- 已启用 `shell` 插件
- 已接入 `shadcn/ui`

## 修改建议

- 请求行为优先检查 `src/core`
- 页面层改动优先检查 `src/pages/Home`
- 涉及窗口、托盘、快捷键、应用搜索时，检查 `src-tauri/src/plugin`、`src-tauri/src/tray.rs`、`src-tauri/src/app_search.rs`

## 验证

```bash
pnpm run oxlint
pnpm run tslint
cargo check -p http-client
```
