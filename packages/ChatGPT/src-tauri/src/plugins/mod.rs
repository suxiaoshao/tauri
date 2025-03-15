/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-01-07 20:34:25
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/plugins/mod.rs
 */
mod adapter;
mod chat;
mod config;
mod log_plugin;
mod temporary_conversation;
mod tray;
mod url_schema;
mod window;

pub(crate) use adapter::AdapterPlugin;
pub(crate) use chat::ChatPlugin;
pub(crate) use config::{ChatGPTConfig, ConfigPlugin, Listenable, MainConfigListener};
pub(crate) use log_plugin::LogPlugin;
pub(crate) use temporary_conversation::{
    TemporaryConversationPlugin, TemporaryHotkeyListener, TemporaryMessage, on_shortcut_trigger,
};
pub(crate) use tray::TrayPlugin;
pub(crate) use window::WindowPlugin;
