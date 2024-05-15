/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-15 20:41:55
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/fetch/types/message.rs
 */
use serde::{Deserialize, Serialize};

use crate::store::Role;

#[derive(Debug, Deserialize, Serialize)]
pub struct Message<'a> {
    pub role: Role,
    pub content: &'a str,
}

impl Message<'_> {
    pub fn new(role: Role, content: &str) -> Message<'_> {
        Message { role, content }
    }
}
