/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-26 19:18:23
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-28 03:23:51
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/store/model/conversation_template_prompts.rs
 */
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

#[derive(Queryable, AsChangeset, Debug)]
#[diesel(table_name = conversation_template_prompts)]
pub struct SqlConversationTemplatePrompt {
    pub(in super::super) id: i32,
    pub(in super::super) template_id: i32,
    pub(in super::super) prompt: String,
    pub(in super::super) role: String,
    pub(in super::super) created_time: OffsetDateTime,
    pub(in super::super) updated_time: OffsetDateTime,
}
