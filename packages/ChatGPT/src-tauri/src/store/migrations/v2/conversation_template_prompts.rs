/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-26 19:18:23
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-30 04:27:21
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/store/model/conversation_template_prompts.rs
 */
use crate::errors::ChatGPTResult;

use diesel::prelude::*;
use time::OffsetDateTime;

use super::schema::conversation_template_prompts;

#[derive(Queryable, AsChangeset, Debug, Clone, Selectable)]
#[diesel(table_name = conversation_template_prompts)]
pub struct SqlConversationTemplatePromptV2 {
    pub(in crate::store) template_id: i32,
    pub(in crate::store) prompt: String,
    pub(in crate::store) role: String,
    pub(in crate::store) created_time: OffsetDateTime,
    pub(in crate::store) updated_time: OffsetDateTime,
}

impl SqlConversationTemplatePromptV2 {
    pub fn all(conn: &mut SqliteConnection) -> ChatGPTResult<Vec<Self>> {
        let prompts = conversation_template_prompts::table
            .select(SqlConversationTemplatePromptV2::as_select())
            .load::<SqlConversationTemplatePromptV2>(conn)?;
        Ok(prompts)
    }
}
