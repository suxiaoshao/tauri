/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-28 04:23:22
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-29 02:56:27
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
        let SqlConversationTemplate {
            id,
            name,
            icon,
            mode,
            model,
            temperature,
            top_p,
            n,
            max_tokens,
            presence_penalty,
            frequency_penalty,
            created_time,
            updated_time,
        } = SqlConversationTemplate::find(id, conn)?;
        let sql_prompts = SqlConversationTemplatePrompt::find_by_template_id(id, conn)?;
        let prompts = sql_prompts
            .into_iter()
            .map(ConversationTemplatePrompt::try_from)
            .collect::<ChatGPTResult<Vec<ConversationTemplatePrompt>>>()?;
        Ok(Self {
            id,
            name,
            icon,
            mode: mode.parse()?,
            model,
            created_time,
            updated_time,
            temperature,
            top_p,
            n,
            max_tokens,
            presence_penalty,
            frequency_penalty,
            prompts,
        })
    }
    pub fn all(conn: &mut SqliteConnection) -> ChatGPTResult<Vec<Self>> {
        let sql_conversation_templates = SqlConversationTemplate::all(conn)?;
        let sql_conversation_template_prompts = SqlConversationTemplatePrompt::all(conn)?;
        let mut conversation_templates = Vec::new();
        for SqlConversationTemplate {
            id,
            name,
            icon,
            mode,
            model,
            temperature,
            top_p,
            n,
            max_tokens,
            presence_penalty,
            frequency_penalty,
            created_time,
            updated_time,
        } in sql_conversation_templates
        {
            let prompts = sql_conversation_template_prompts
                .iter()
                .filter(|prompt| prompt.template_id == id)
                .cloned()
                .map(ConversationTemplatePrompt::try_from)
                .collect::<ChatGPTResult<Vec<ConversationTemplatePrompt>>>()?;
            conversation_templates.push(Self {
                id,
                name,
                icon,
                mode: mode.parse()?,
                model,
                created_time,
                updated_time,
                temperature,
                top_p,
                n,
                max_tokens,
                presence_penalty,
                frequency_penalty,
                prompts,
            });
        }
        Ok(conversation_templates)
    }
}
