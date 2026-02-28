# AGENTS.md

## 项目概览

这是一个 `pnpm workspace + Cargo workspace` 组成的多包仓库，核心是多个基于 `Tauri 2 + React 19 + TypeScript + Rsbuild` 的桌面应用，以及少量独立 Rust 工具包。

- 前端包位于 `packages/*`
- 共享前端代码位于 `common/*`
- Rust 共享 crate 位于 `crates/*`
- Tauri 后端代码通常位于各应用的 `packages/<app>/src-tauri`

## 目录职责

### 应用包

- `packages/ChatGPT`: 功能最完整的聊天应用，前端在 `src`，Tauri/Rust 后端在 `src-tauri`
- `packages/Hclipboard`: 剪贴板历史相关应用，包含前端和 `src-tauri` 数据存储/插件逻辑
- `packages/http-client`: HTTP 请求客户端，前端在 `src`，Tauri 插件和窗口逻辑在 `src-tauri`
- `packages/feiwen`: 小说抓取/整理相关应用，抓取与存储逻辑在 `src-tauri`
- `packages/movie`: 独立 Rust 包
- `packages/remove`: 独立 Rust 包

### 共享包

- `common/theme`: 主题相关共享代码
- `common/notify`: 通知相关共享代码
- `common/time`: 时间格式化等工具
- `common/types`: 共享类型
- `crates/delay`: Rust 共享 crate

## 技术栈与约定

- 包管理器：`pnpm`
- 前端构建：`rsbuild`
- 前端框架：`React 19`
- TypeScript：根 `tsconfig.json` 开启 `strict`
- Rust 工作区：根 `Cargo.toml`
- Tauri 版本：2.x
- UI 组件大量使用 `Radix UI`、`class-variance-authority`、`tailwind-merge`
- 前端包普遍启用了 `babel-plugin-react-compiler`

## Tauri 文档入口

- 插件总览：`https://tauri.app/plugin/`
- 配置参考：`https://tauri.app/reference/config/`
- JavaScript API：`https://tauri.app/reference/javascript/api/`
- Rust API：`https://docs.rs/tauri/2.10.2/tauri/`
- 其他官方文档入口：`https://tauri.app/start/`

## 关键事实（写代码前先记住）

- 这是多应用仓库，不存在单一前端入口；开发时先确认目标应用，再进入对应 `packages/<app>` 上下文。
- `packages/ChatGPT`、`packages/feiwen`、`packages/Hclipboard`、`packages/http-client` 都包含 `components.json`，并接入了 `shadcn/ui` 风格组件体系。
- 各应用普遍采用 `new-york` 风格、`lucide` 图标、CSS Variables 方案，Tailwind 样式入口通常是 `src/index.css`。
- CI 位于 `.github/workflows/ci.yaml`，当前会执行 `pnpm lint`、`pnpm test`、`pnpm run build:web`、`cargo clippy --all`、`cargo test --all`。
- GitHub issue 模板已存在，位于 `.github/ISSUE_TEMPLATE/`，包含 `bug_report.yml`、`feature_request.yml`、`tech_request.yml`。

## shadcn/ui 规则

- 遇到 `shadcn/ui` 相关问题时，优先检查目标应用的 `components.json`，不要凭印象修改组件别名、样式入口或 registry。
- 新增或迁移 `shadcn/ui` 组件时，保持在目标应用自己的 `src/components/ui` 下，不要跨应用混用组件目录。
- 需要复用组件时，优先复用现有 `src/components/ui/*` 实现；只有在多个应用都明确需要同一抽象时，才考虑提炼到共享层。
- 不要随意改动 `components.json` 中的 `aliases`、`tailwind.css`、`baseColor`、`registries`，除非任务明确要求。
- 若任务涉及 `shadcn/ui` 组件 API、CLI、registry 或迁移规则，先查 `https://ui.shadcn.com/llms.txt`，再按文档处理。

## 常用命令

在仓库根目录执行：

- 安装依赖：`pnpm install`
- 格式化：`pnpm run format`
- 全量检查：`pnpm run lint`
- 单独运行 oxlint：`pnpm run oxlint`
- TypeScript 构建检查：`pnpm run tslint`
- 测试：`pnpm run test`
- 构建所有前端：`pnpm run build:web`
- 构建所有 Tauri 应用：`pnpm run build:tauri`

运行单个应用时，优先使用过滤命令：

- `pnpm --filter ChatGPT dev`
- `pnpm --filter ChatGPT build`
- `pnpm --filter ChatGPT tauri dev`
- `pnpm --filter h-clipboard tauri dev`
- `pnpm --filter http-client tauri dev`
- `pnpm --filter feiwen tauri dev`

如果要运行 Rust 包：

- `cargo check -p delay`
- `cargo check -p movie`
- `cargo check -p remove`

## 路径与导入

根 `tsconfig.json` 中已定义路径别名：

- `@chatgpt/* -> packages/ChatGPT/src/*`
- `@feiwen/* -> packages/feiwen/src/*`
- `@hclipboard/* -> packages/Hclipboard/src/*`
- `@http-client/* -> packages/http-client/src/*`

共享包通常通过 workspace 包名直接引用：

- `theme`
- `notify`
- `time`
- `types`

修改前端代码时，优先复用 `common/*` 中已有能力，不要在各应用内重复实现主题、通知、时间和基础类型。

## 工作方式建议

### 修改前端时

- 先确认目标应用位于哪个 `packages/<app>/src`
- 优先沿用现有组件目录结构，例如 `components`、`features`、`service`、`hooks`
- 保持已有技术选型，不要无故切换到新状态管理或新 UI 库
- 本仓库已启用 React Compiler，不要默认到处添加 `useMemo`/`useCallback`
- 共享逻辑优先抽到 `common/*`，但只在至少两个包真正需要时再抽
- 涉及 `shadcn/ui` 组件时，优先在目标应用现有 `components/ui` 体系内补齐，不要另起一套封装
- 修改样式时，优先使用当前应用的 CSS Variables、Tailwind 原子类和现有 `utils` 辅助函数

### 修改 Tauri/Rust 时

- 先确认目标应用的后端是否在 `packages/<app>/src-tauri`
- 数据存储、插件、窗口、托盘、快捷键等逻辑通常分布在 `plugin.rs`、`plugins/*`、`store/*`、`window/*`
- 跨应用可复用的 Rust 逻辑优先考虑放到 `crates/*`
- 改动 schema、migration、store service 时，必须同时检查调用链和数据兼容性
- 涉及 Tauri capability、插件权限、窗口行为时，连同 `tauri.conf.json`、`capabilities/*.json` 一起检查
- 遇到 Tauri API、配置、插件用法不确定时，优先查上面的官方文档入口，不要凭旧版本记忆修改

### 修改测试时

- Jest 配置在根目录 `jest.config.ts`
- 测试环境为 `jsdom`
- 测试初始化位于 `config/test/testSetup.ts`
- 现有测试较少，新增行为改动时优先补最接近变更点的测试

## 提交前最低检查

如果只改了前端 TypeScript/React：

- `pnpm run oxlint`
- `pnpm run tslint`

如果改了共享包或影响范围不明确：

- `pnpm run lint`
- `pnpm run test`

如果改了 Rust/Tauri：

- 对应包执行 `cargo clippy`
- 如涉及前后端联动，再执行对应应用的 `pnpm --filter <pkg> tauri dev` 或至少 `pnpm --filter <pkg> build`

## 完成后验证（必须执行）

- 完成任何代码修改后，必须运行与改动直接相关的验证命令，不能只修改不验证。
- 修改了前端代码：至少运行 `pnpm run oxlint` 和 `pnpm run tslint`。
- 修改了前端测试、测试配置或会影响测试行为的实现：还必须运行 `pnpm run test`。
- 修改了共享前端包 `common/*`：默认执行 `pnpm run lint`，必要时补 `pnpm run test`。
- 修改了 Rust 代码：至少运行相关包的 `cargo check -p <pkg>`。
- 修改了 Rust 测试、migration、store、插件或影响运行时行为的 Rust 实现：优先运行 `cargo test -p <pkg>`；影响面不清晰时运行 `cargo test --all`。
- 若改动可能影响 CI 结果，按 CI 对齐执行：`pnpm lint`、`pnpm test`、`pnpm run build:web`、`cargo clippy --all`、`cargo test --all`。
- 汇报结果时应注明实际执行过的验证命令；如果没执行，必须说明原因。

## 本仓库内的实现偏好

- 优先做小范围、定点修改，不要无关重构
- 不要随意改动所有包共用的构建配置，除非任务明确要求
- 不要新增与现有模式重复的基础设施
- 新增文件时遵循现有命名风格和目录层级
- 保持 ASCII 为默认字符集，除非目标文件已经明确使用非 ASCII 内容
- 涉及 Windows 行为、快捷键、托盘、剪贴板、文件系统能力时，优先查看对应 `src-tauri` 实现后再改

## 修改约束

- 修改或新增代码文件时，统一使用 `UTF-8` 编码。
- 修改或新增代码文件时，统一使用 `LF` 换行符。
- 不要凭空新增仓库里不存在的构建体系、脚手架或脚本约定。
- 不要把同一功能同时改成“前端一套、Tauri 一套”的重复实现；优先延续现有分层边界。
- 不要在无明确需求时批量调整 import 顺序、文件命名、目录结构或格式化整个仓库。
- 不要修改不相关应用的 `components.json`、`rsbuild.config.ts`、`tauri.conf.json`。
- 涉及数据库 schema / migration 时，必须同步检查对应 `migrations/`、`schema.rs`、`model.rs`、`service.rs`。
- 共享逻辑只有在多个包真实复用时再抽象；不要为了“看起来更通用”提前抽层。
- 未经要求不要引入新的状态管理、样式方案、请求库或表单库。

## 文档与交付要求

- 文档和说明优先写可直接执行的命令，而不是泛泛描述。
- 结果说明应优先包含：改动范围、关键行为变化、验证命令。
- 若某命令依赖外部条件，例如系统 GUI、Tauri 运行环境、平台能力或网络权限，必须明确标注。

## GitHub 协作规则

- 当用户要求执行 GitHub 相关操作时，优先使用 `gh` 命令行，而不是手写推测性结果。
- 若 `gh` 遇到未登录、权限不足或沙盒限制，直接申请相应权限，不要绕过认证流程。
- 当用户要求编写 issue、PR 描述、release note 或评论内容时，先查看 `.github` 下的现有模板和工作流，再按仓库惯例组织内容。
- 编写 issue 内容时，优先参考 `.github/ISSUE_TEMPLATE/bug_report.yml`、`.github/ISSUE_TEMPLATE/feature_request.yml`、`.github/ISSUE_TEMPLATE/tech_request.yml`。
- 这套 issue 模板包含 `product` 和 `component` 维度；写 issue 时应尽量带上具体产品名，例如 `feiwen`、`Hclipboard`、`http-client`、`movie`、`remove`、`ChatGPT`、`common` 或 `all`。

## 额外说明

- 多个应用使用相同的 `rsbuild.config.ts` 模式，但开发端口不完全一致，启动前先检查目标包配置
- 根目录存在 `node_modules` 与 `target`，搜索时应避免把它们当作业务代码
- PowerShell 环境可能输出与 `fnm` 相关的 profile 噪声，这不是项目代码问题
