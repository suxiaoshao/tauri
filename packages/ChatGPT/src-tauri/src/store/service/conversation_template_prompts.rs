/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-28 04:28:20
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-28 04:30:59
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/store/service/conversation_template_prompts.rs
 */
use time::OffsetDateTime;

use crate::store::Role;

use super::utils::serialize_offset_date_time;

#[derive(serde::Serialize)]
pub struct ConversationTemplatePrompt {
    pub id: i32,
    pub template_id: i32,
    pub prompt: String,
    pub role: Role,
    #[serde(
        rename = "createdTime",
        serialize_with = "serialize_offset_date_time",
        deserialize_with = "deserialize_offset_date_time"
    )]
    pub created_time: OffsetDateTime,
    #[serde(
        rename = "updatedTime",
        serialize_with = "serialize_offset_date_time",
        deserialize_with = "deserialize_offset_date_time"
    )]
    pub updated_time: OffsetDateTime,
}
