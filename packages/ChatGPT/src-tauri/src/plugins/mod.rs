/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-01-07 20:34:25
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/plugins/mod.rs
 */
mod chat;
mod config;
mod log_plugin;
mod temporary_conversation;
mod tray;
mod window;

pub use chat::ChatPlugin;
pub use config::{ChatGPTConfig, ConfigPlugin, Listenable, MainConfigListener};
pub use log_plugin::LogPlugin;
pub use temporary_conversation::{TemporaryConversationPlugin, TemporaryHotkeyListener};
pub use tray::TrayPlugin;
pub use window::WindowPlugin;
