/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-28 04:23:22
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-28 07:27:40
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/store/service/conversation_templates.rs
 */

use diesel::SqliteConnection;
use time::OffsetDateTime;

use crate::{
    errors::ChatGPTResult,
    store::{
        model::{
            conversation_template_prompts::SqlConversationTemplatePrompt,
            conversation_templates::SqlConversationTemplate,
        },
        Mode,
    },
};

use super::{
    conversation_template_prompts::ConversationTemplatePrompt, utils::serialize_offset_date_time,
};

#[derive(serde::Serialize)]
pub struct ConversationTemplate {
    pub id: i32,
    pub name: String,
    pub icon: String,
    pub mode: Mode,
    pub model: String,
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
    pub temperature: f64,
    #[serde(rename = "topP")]
    pub top_p: f64,
    pub n: i64,
    #[serde(rename = "maxTokens")]
    pub max_tokens: Option<i64>,
    #[serde(rename = "presencePenalty")]
    pub presence_penalty: f64,
    #[serde(rename = "frequencyPenalty")]
    pub frequency_penalty: f64,
    pub prompts: Vec<ConversationTemplatePrompt>,
}

impl ConversationTemplate {
    pub fn find(id: i32, conn: &mut SqliteConnection) -> ChatGPTResult<Self> {
        let sql_conversation_template = SqlConversationTemplate::find(id, conn)?;
        let sql_prompts = SqlConversationTemplatePrompt::find_by_template_id(id, conn)?;
        let prompts = sql_prompts
            .into_iter()
            .map(ConversationTemplatePrompt::try_from)
            .collect::<ChatGPTResult<Vec<ConversationTemplatePrompt>>>()?;
        Ok(Self {
            id: sql_conversation_template.id,
            name: sql_conversation_template.name,
            icon: sql_conversation_template.icon,
            mode: sql_conversation_template.mode.parse()?,
            model: sql_conversation_template.model,
            created_time: sql_conversation_template.created_time,
            updated_time: sql_conversation_template.updated_time,
            temperature: sql_conversation_template.temperature,
            top_p: sql_conversation_template.top_p,
            n: sql_conversation_template.n,
            max_tokens: sql_conversation_template.max_tokens,
            presence_penalty: sql_conversation_template.presence_penalty,
            frequency_penalty: sql_conversation_template.frequency_penalty,
            prompts,
        })
    }
}
