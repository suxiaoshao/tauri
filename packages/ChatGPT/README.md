# ChatGPT

## 简介

`ChatGPT` 是仓库中功能最完整的 Tauri 桌面应用，前端使用 `React 19 + TypeScript + Rsbuild`，后端位于 `src-tauri`。

## 目录

- `src/`：前端页面、组件、状态与服务
- `src-tauri/`：Tauri 后端、插件、存储、迁移与适配器
- `components.json`：`shadcn/ui` 配置
- `rsbuild.config.ts`：前端构建配置

## 开发

在仓库根目录执行：

```bash
pnpm --filter ChatGPT dev
pnpm --filter ChatGPT build
pnpm --filter ChatGPT tauri dev
pnpm --filter ChatGPT tauri build
```

## 关键事实

- 前端开发端口：`1420`
- 产品名：`ChatGPT`
- Tauri 配置：`src-tauri/tauri.conf.json`
- 已接入 `shadcn/ui`
- 已启用 `babel-plugin-react-compiler`

## 修改建议

- UI 改动优先沿用 `src/components`、`src/features`、`src/service`
- `shadcn/ui` 组件优先放在 `src/components/ui`
- 数据、迁移、聊天适配器改动时，同时检查 `src-tauri/src/store` 与 `src-tauri/src/adapter`

## 验证

```bash
pnpm run oxlint
pnpm run tslint
pnpm run test
```
