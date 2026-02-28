# feiwen

## 简介

`feiwen` 是一个基于 Tauri 的小说抓取与整理工具，包含前端查询/抓取界面，以及后端抓取、解析、存储能力。

## 目录

- `src/`：前端页面、组件与服务
- `src-tauri/`：抓取、解析、存储、插件与 migration 逻辑
- `components.json`：`shadcn/ui` 配置
- `rsbuild.config.ts`：前端构建配置

## 开发

在仓库根目录执行：

```bash
pnpm --filter feiwen dev
pnpm --filter feiwen build
pnpm --filter feiwen tauri dev
pnpm --filter feiwen tauri build
```

## 关键事实

- 前端开发端口：`3001`
- 产品名：`废文`
- Tauri 配置：`src-tauri/tauri.conf.json`
- 已接入 `shadcn/ui`

## 修改建议

- 抓取流程优先检查 `src-tauri/src/fetch*`
- 数据模型与持久化优先检查 `src-tauri/src/store`
- 前端查询与抓取页面主要在 `src/page`

## 验证

```bash
pnpm run oxlint
pnpm run tslint
cargo check -p feiwen
```
