/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-26 19:18:23
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-28 20:12:51
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/store/model/conversation_template_prompts.rs
 */
use crate::errors::ChatGPTResult;

use super::super::schema::conversation_template_prompts;
use diesel::prelude::*;
use time::OffsetDateTime;
#[derive(Insertable)]
#[diesel(table_name = conversation_template_prompts)]
pub struct SqlNewConversationTemplatePrompt {
    pub(in super::super) template_id: i32,
    pub(in super::super) prompt: String,
    pub(in super::super) role: String,
    pub(in super::super) created_time: OffsetDateTime,
    pub(in super::super) updated_time: OffsetDateTime,
}

impl SqlNewConversationTemplatePrompt {
    pub fn migration_save(
        prompts: Vec<SqlNewConversationTemplatePrompt>,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<()> {
        diesel::insert_into(conversation_template_prompts::table)
            .values(prompts)
            .execute(conn)?;
        Ok(())
    }
}

#[derive(Queryable, AsChangeset, Debug, Clone)]
#[diesel(table_name = conversation_template_prompts)]
pub struct SqlConversationTemplatePrompt {
    pub(in super::super) id: i32,
    pub(in super::super) template_id: i32,
    pub(in super::super) prompt: String,
    pub(in super::super) role: String,
    pub(in super::super) created_time: OffsetDateTime,
    pub(in super::super) updated_time: OffsetDateTime,
}

impl SqlConversationTemplatePrompt {
    pub fn find_by_template_id(
        template_id: i32,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<Vec<Self>> {
        let prompts = conversation_template_prompts::table
            .filter(conversation_template_prompts::template_id.eq(template_id))
            .load::<SqlConversationTemplatePrompt>(conn)?;
        Ok(prompts)
    }
    pub fn all(conn: &mut SqliteConnection) -> ChatGPTResult<Vec<Self>> {
        let prompts =
            conversation_template_prompts::table.load::<SqlConversationTemplatePrompt>(conn)?;
        Ok(prompts)
    }
}
