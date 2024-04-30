/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-28 04:28:20
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-30 05:06:08
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/store/service/conversation_template_prompts.rs
 */
use time::OffsetDateTime;

use crate::{
    errors::ChatGPTError,
    store::{model::conversation_template_prompts::SqlConversationTemplatePrompt, Role},
};

use super::utils::serialize_offset_date_time;

#[derive(serde::Serialize)]
pub struct ConversationTemplatePrompt {
    pub id: i32,
    #[serde(rename = "templateId")]
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

impl TryFrom<SqlConversationTemplatePrompt> for ConversationTemplatePrompt {
    type Error = ChatGPTError;

    fn try_from(value: SqlConversationTemplatePrompt) -> Result<Self, Self::Error> {
        Ok(Self {
            id: value.id,
            template_id: value.template_id,
            prompt: value.prompt,
            role: value.role.parse()?,
            created_time: value.created_time,
            updated_time: value.updated_time,
        })
    }
}

#[derive(serde::Deserialize)]
pub struct NewConversationTemplatePrompt {
    pub prompt: String,
    pub role: Role,
}
