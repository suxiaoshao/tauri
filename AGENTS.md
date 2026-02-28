# AGENTS.md

## 仓库概览

这是一个 `pnpm workspace + Cargo workspace` 多包仓库，核心是多个基于 `Tauri 2 + React 19 + TypeScript + Rsbuild` 的桌面应用，以及少量独立 Rust 包。

- 前端应用：`packages/*`
- 前端共享：`common/*`
- Rust 共享 crate：`crates/*`
- Tauri 后端通常位于 `packages/<app>/src-tauri`

主要应用：

- `packages/ChatGPT`
- `packages/Hclipboard`
- `packages/http-client`
- `packages/feiwen`
- `packages/movie`
- `packages/remove`

共享包：

- `common/theme`
- `common/notify`
- `common/time`
- `common/types`
- `crates/delay`

## 先记住的事实

- 这是多应用仓库，不存在单一前端入口。开始修改前先确认目标应用。
- 根 `tsconfig.json` 开启 `strict`，不要引入宽松类型写法。
- 路径别名：
  - `@chatgpt/* -> packages/ChatGPT/src/*`
  - `@feiwen/* -> packages/feiwen/src/*`
  - `@hclipboard/* -> packages/Hclipboard/src/*`
  - `@http-client/* -> packages/http-client/src/*`
- 共享前端能力优先复用 `common/*`，但只有至少两个包真实需要时才抽象。
- 不要无关重构，不要批量改 import、命名、目录结构或全仓格式化。

## UI 约定

- 各应用使用 `shadcn/ui` 体系，并带有自己的 `components.json`。
- `src/components/ui/*` 是目标应用自己的 shadcn 组件目录，通常由 shadcn 安装/生成，并基于 `Base UI`、`class-variance-authority`、`tailwind-merge` 演进。
- 不要把 `components/ui/*` 当成通用第三方源码目录整体替换，也不要按 `Radix UI` 项目去理解或迁移。
- 涉及 `shadcn/ui` 时，先检查目标应用的 `components.json`，不要凭印象修改 `aliases`、`tailwind.css`、`baseColor`、`registries`。
- 新增或迁移 shadcn 组件时，保持在目标应用自己的 `src/components/ui` 下，不要跨应用混用。
- 若问题涉及 shadcn API、CLI、registry 或迁移规则，先查 `https://ui.shadcn.com/llms.txt`。

## 前端修改规则

- 先进入目标应用上下文，再修改 `components`、`features`、`service`、`hooks` 等现有目录。
- 保持现有技术选型，不要无故引入新的状态管理、样式方案、请求库或表单库。
- 仓库启用了 React Compiler，不要默认到处添加 `useMemo`/`useCallback`。
- 样式优先沿用当前应用的 CSS Variables、Tailwind 原子类和现有工具函数。
- 不要修改不相关应用的 `components.json`、`rsbuild.config.ts`、`tauri.conf.json`。

## Tauri / Rust 规则

- 修改前先确认后端是否位于 `packages/<app>/src-tauri`。
- 数据存储、插件、窗口、托盘、快捷键等逻辑通常在 `plugin.rs`、`plugins/*`、`store/*`、`window/*`。
- 影响 capability、插件权限、窗口行为时，要连同 `tauri.conf.json`、`capabilities/*.json` 一起检查。
- 涉及 schema、migration、store service 时，必须同步检查 `migrations/`、`schema.rs`、`model.rs`、`service.rs`。
- 可复用的 Rust 逻辑优先考虑放到 `crates/*`。
- 不确定 Tauri API 或配置时，优先查官方文档：
  - `https://tauri.app/plugin/`
  - `https://tauri.app/reference/config/`
  - `https://tauri.app/reference/javascript/api/`
  - `https://docs.rs/tauri/2.10.2/tauri/`

## 提权与命令规则

- 任何需要联网、安装依赖、修改 lockfile、运行 `pnpm install`、`pnpm add`、`pnpm dlx`、`cargo install`、`gh` 写操作或其他超出沙盒权限的命令，必须先向用户申请权限。
- 不要通过读取缓存、手动拼接临时目录、直接调用已缓存二进制或其他绕过方式替代正式提权。
- 若命令因权限、网络或沙盒限制失败，应直接按实际命令重新申请权限，不要换成规避限制的替代方案。
- 删除文件、覆盖生成产物或改写锁文件前，也要先明确说明并申请权限。

## 常用命令

根目录：

- `pnpm install`
- `pnpm run format`
- `pnpm run oxlint`
- `pnpm run knip`
- `pnpm run tslint`
- `pnpm run lint`
- `pnpm run test`
- `pnpm run build:web`
- `pnpm run build:tauri`

单应用：

- `pnpm --filter ChatGPT dev`
- `pnpm --filter ChatGPT build`
- `pnpm --filter ChatGPT tauri dev`
- `pnpm --filter h-clipboard tauri dev`
- `pnpm --filter http-client tauri dev`
- `pnpm --filter feiwen tauri dev`

Rust：

- `cargo check -p delay`
- `cargo check -p movie`
- `cargo check -p remove`

## 验证要求

- 任何代码修改后，都必须执行与改动直接相关的验证命令。
- 修改前端代码：至少运行 `pnpm run oxlint` 和 `pnpm run tslint`。
- 修改 `knip.json`、依赖声明、导出声明或清理未使用代码：补充执行 `pnpm run knip`。
- 修改前端测试、测试配置或影响测试行为的实现：补充执行 `pnpm run test`。
- 修改共享前端包 `common/*`：默认执行 `pnpm run lint`，必要时补 `pnpm run test`。
- 修改 Rust 代码：至少执行相关包的 `cargo check -p <pkg>`。
- 修改 Rust 测试、migration、store、插件或其他运行时关键逻辑：优先执行 `cargo test -p <pkg>`；影响面不清晰时执行 `cargo test --all`。
- 若改动可能影响 CI，按 CI 对齐执行：`pnpm lint`、`pnpm test`、`pnpm run build:web`、`cargo clippy --all`、`cargo test --all`。
- 汇报时要写明实际执行过的验证命令；如果没执行，必须说明原因。

## GitHub 规则

- GitHub 相关操作优先使用 `gh`，不要手写推测性结果。
- 若 `gh` 需要登录、权限或沙盒放行，直接申请权限，不要绕过认证流程。
- 编写 issue、PR、release note、评论前，先检查 `.github` 下现有模板和工作流。
- issue 内容优先参考 `.github/ISSUE_TEMPLATE/bug_report.yml`、`feature_request.yml`、`tech_request.yml`。
- issue 应尽量带上明确产品名：`feiwen`、`Hclipboard`、`http-client`、`movie`、`remove`、`ChatGPT`、`common` 或 `all`。

## 其他

- 修改或新增代码文件时，统一使用 `UTF-8` 编码和 `LF` 换行符。
- 搜索代码时避开根目录 `node_modules` 与 `target`。
- PowerShell 里若出现 `fnm` profile 噪声，可忽略，不是项目代码问题。
