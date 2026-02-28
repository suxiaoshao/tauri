# Hclipboard

## 简介

`Hclipboard` 是一个基于 Tauri 的剪贴板历史工具，包含前端界面、窗口/快捷键/剪贴板插件逻辑，以及本地存储能力。

## 目录

- `src/`：前端页面与组件
- `src-tauri/`：剪贴板、窗口、日志、存储与 migration 逻辑
- `components.json`：`shadcn/ui` 配置
- `rsbuild.config.ts`：前端构建配置

## 开发

在仓库根目录执行：

```bash
pnpm --filter h-clipboard dev
pnpm --filter h-clipboard build
pnpm --filter h-clipboard tauri dev
pnpm --filter h-clipboard tauri build
```

## 关键事实

- 前端开发端口：`1420`
- 产品名：`Hclipboard`
- Tauri 配置：`src-tauri/tauri.conf.json`
- 已接入 `shadcn/ui`

## 修改建议

- 涉及剪贴板采集、窗口唤起、快捷键时，优先检查 `src-tauri/src/plugin`
- 涉及历史记录与持久化时，优先检查 `src-tauri/src/store`
- 前端展示层优先沿用现有 `pages/Home` 和 `components/ui` 结构

## 验证

```bash
pnpm run oxlint
pnpm run tslint
cargo check -p h-clipboard
```
