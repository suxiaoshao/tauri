/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-28 04:23:22
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 03:04:57
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/store/service/conversation_templates.rs
 */

use diesel::SqliteConnection;
use time::OffsetDateTime;

use crate::{
    errors::ChatGPTResult,
    store::{
        model::{
            conversation_template_prompts::{
                SqlConversationTemplatePrompt, SqlNewConversationTemplatePrompt,
            },
            conversation_templates::{
                SqlConversationTemplate, SqlNewConversationTemplate, SqlUpdateConversationTemplate,
            },
            conversations::SqlConversation,
        },
        Mode, NewConversationTemplatePrompt,
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
    pub description: Option<String>,
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
            description,
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
            description,
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
            description,
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
                description,
            });
        }
        Ok(conversation_templates)
    }
    pub fn update(
        NewConversationTemplate {
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
            prompts,
            description,
        }: NewConversationTemplate,
        id: i32,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<()> {
        let time = OffsetDateTime::now_utc();
        conn.immediate_transaction(|conn| {
            // Update the conversation template
            let sql_new = SqlUpdateConversationTemplate {
                id,
                name,
                icon,
                mode: mode.to_string(),
                model,
                temperature,
                top_p,
                n,
                max_tokens,
                presence_penalty,
                frequency_penalty,
                updated_time: time,
                description,
            };
            sql_new.update(conn)?;

            // delete the old prompts and insert the new prompts
            SqlConversationTemplatePrompt::delete_by_template_id(id, conn)?;
            let prompts = prompts
                .into_iter()
                .map(|prompt| SqlNewConversationTemplatePrompt {
                    template_id: id,
                    prompt: prompt.prompt,
                    role: prompt.role.to_string(),
                    created_time: time,
                    updated_time: time,
                })
                .collect::<Vec<SqlNewConversationTemplatePrompt>>();
            SqlNewConversationTemplatePrompt::save_many(prompts, conn)?;
            Ok(())
        })
    }
    pub fn delete(id: i32, conn: &mut SqliteConnection) -> ChatGPTResult<()> {
        conn.immediate_transaction(|conn| {
            if SqlConversation::exists_by_template_id(id, conn)? {
                return Err(crate::errors::ChatGPTError::TemplateHasConversation);
            }
            SqlConversationTemplatePrompt::delete_by_template_id(id, conn)?;
            SqlConversationTemplate::delete_by_id(id, conn)?;
            Ok(())
        })
    }
}

#[derive(serde::Deserialize)]
pub struct NewConversationTemplate {
    pub name: String,
    pub icon: String,
    pub description: Option<String>,
    pub mode: Mode,
    pub model: String,
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
    pub prompts: Vec<NewConversationTemplatePrompt>,
}

impl NewConversationTemplate {
    pub fn insert(self, conn: &mut SqliteConnection) -> ChatGPTResult<i32> {
        let NewConversationTemplate {
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
            prompts,
            description,
        } = self;
        let time = OffsetDateTime::now_utc();
        conn.immediate_transaction(|conn| {
            // Insert the new conversation template
            let sql_new = SqlNewConversationTemplate {
                name,
                icon,
                mode: mode.to_string(),
                model,
                temperature,
                top_p,
                n,
                max_tokens,
                presence_penalty,
                frequency_penalty,
                created_time: time,
                updated_time: time,
                description,
            };
            sql_new.insert(conn)?;

            // Insert the prompts
            let SqlConversationTemplate { id, .. } = SqlConversationTemplate::first(conn)?;
            let prompts = prompts
                .into_iter()
                .map(|prompt| SqlNewConversationTemplatePrompt {
                    template_id: id,
                    prompt: prompt.prompt,
                    role: prompt.role.to_string(),
                    created_time: time,
                    updated_time: time,
                })
                .collect::<Vec<SqlNewConversationTemplatePrompt>>();
            SqlNewConversationTemplatePrompt::save_many(prompts, conn)?;
            Ok(id)
        })
    }
}
