/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-28 04:23:22
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-16 04:24:23
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/store/service/conversation_templates.rs
 */

use std::str::FromStr;

use diesel::SqliteConnection;
use time::OffsetDateTime;

use crate::{
    errors::ChatGPTResult,
    store::{
        Mode, Role,
        model::{
            SqlConversation, SqlConversationTemplate, SqlNewConversationTemplate,
            SqlUpdateConversationTemplate,
        },
    },
};

use super::utils::{deserialize_offset_date_time, serialize_offset_date_time};

#[derive(serde::Serialize, Clone, serde::Deserialize)]
pub struct ConversationTemplatePrompt {
    pub prompt: String,
    pub role: Role,
}

#[derive(serde::Serialize, serde::Deserialize, Clone)]
pub struct ConversationTemplate {
    pub id: i32,
    pub name: String,
    pub icon: String,
    pub description: Option<String>,
    pub mode: Mode,
    pub adapter: String,
    pub template: serde_json::Value,
    pub prompts: Vec<ConversationTemplatePrompt>,
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

impl ConversationTemplate {
    pub fn find(id: i32, conn: &mut SqliteConnection) -> ChatGPTResult<Self> {
        let SqlConversationTemplate {
            id,
            name,
            icon,
            template,
            adapter,
            created_time,
            updated_time,
            description,
            mode,
            prompts,
        } = SqlConversationTemplate::find(id, conn)?;
        Ok(Self {
            id,
            name,
            icon,
            created_time,
            updated_time,
            adapter,
            description,
            template: serde_json::Value::from_str(&template)?,
            prompts: serde_json::from_str(&prompts)?,
            mode: mode.parse()?,
        })
    }
    pub fn all(conn: &mut SqliteConnection) -> ChatGPTResult<Vec<Self>> {
        let sql_conversation_templates = SqlConversationTemplate::all(conn)?;
        let mut conversation_templates = Vec::new();
        for SqlConversationTemplate {
            id,
            name,
            icon,
            created_time,
            updated_time,
            description,
            template,
            adapter,
            mode,
            prompts,
        } in sql_conversation_templates
        {
            conversation_templates.push(Self {
                id,
                name,
                icon,
                created_time,
                updated_time,
                description,
                template: serde_json::Value::from_str(&template)?,
                adapter,
                mode: mode.parse()?,
                prompts: serde_json::from_str(&prompts)?,
            });
        }
        Ok(conversation_templates)
    }
    pub fn update(
        NewConversationTemplate {
            name,
            icon,
            template,
            adapter,
            description,
            mode,
            prompts,
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
                adapter,
                template: serde_json::to_string(&template)?,
                updated_time: time,
                description,
                mode: mode.to_string(),
                prompts: serde_json::to_string(&prompts)?,
            };
            sql_new.update(conn)?;
            Ok(())
        })
    }
    pub fn delete(id: i32, conn: &mut SqliteConnection) -> ChatGPTResult<()> {
        conn.immediate_transaction(|conn| {
            if SqlConversation::exists_by_template_id(id, conn)? {
                return Err(crate::errors::ChatGPTError::TemplateHasConversation);
            }
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
    pub adapter: String,
    pub template: serde_json::Value,
    pub prompts: Vec<ConversationTemplatePrompt>,
}

impl NewConversationTemplate {
    pub fn insert(self, conn: &mut SqliteConnection) -> ChatGPTResult<i32> {
        let NewConversationTemplate {
            name,
            icon,
            description,
            mode,
            template,
            adapter,
            prompts,
        } = self;
        let time = OffsetDateTime::now_utc();
        conn.immediate_transaction(|conn| {
            // Insert the new conversation template
            let sql_new = SqlNewConversationTemplate {
                name,
                icon,
                template: serde_json::to_string(&template)?,
                adapter,
                created_time: time,
                updated_time: time,
                description,
                mode: mode.to_string(),
                prompts: serde_json::to_string(&prompts)?,
            };
            sql_new.insert(conn)?;

            // Insert the prompts
            let SqlConversationTemplate { id, .. } = SqlConversationTemplate::first(conn)?;
            Ok(id)
        })
    }
}
