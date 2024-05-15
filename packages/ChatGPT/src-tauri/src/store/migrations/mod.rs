/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-24 19:32:30
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 01:12:22
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/store/migrations/mod.rs
 */
use crate::{
    errors::ChatGPTResult,
    store::{
        migrations::v1::AllDataV1,
        model::{SqlFolder, SqlMessage},
    },
};

use diesel::{connection::SimpleConnection, SqliteConnection};

use self::{v1::SqlConversationV1, v2::AllDataV2};

use super::{
    model::{
        SqlConversation, SqlConversationTemplate, SqlConversationTemplatePrompt,
        SqlNewConversationTemplatePrompt,
    },
    Role, CREATE_TABLE_SQL,
};

pub(super) mod v1;
pub(super) mod v2;

pub(in crate::store) fn v1_to_v3(
    v1_conn: &mut SqliteConnection,
    v3_conn: &mut SqliteConnection,
) -> ChatGPTResult<()> {
    v3_conn.batch_execute(CREATE_TABLE_SQL)?;
    // get all data from v1
    let AllDataV1 {
        conversations,
        folders,
        messages,
    } = v1::AllDataV1::new(v1_conn)?;
    // migrate folders
    let v3_folders = folders.into_iter().map(SqlFolder::from).collect::<Vec<_>>();
    SqlFolder::migration_save(v3_folders, v3_conn)?;

    // migrate conversations
    let (v3_conversations, v3_templates, v2_prompts) = get_conversations(conversations);
    SqlConversationTemplate::migration_save(v3_templates, v3_conn)?;
    SqlConversation::migration_save(v3_conversations, v3_conn)?;
    SqlNewConversationTemplatePrompt::save_many(v2_prompts, v3_conn)?;

    // migrate messages
    let v3_messages = messages
        .into_iter()
        .map(SqlMessage::from)
        .collect::<Vec<_>>();
    SqlMessage::migration_save(v3_messages, v3_conn)?;
    Ok(())
}

fn get_conversations(
    v1_conversations: Vec<SqlConversationV1>,
) -> (
    Vec<SqlConversation>,
    Vec<SqlConversationTemplate>,
    Vec<SqlNewConversationTemplatePrompt>,
) {
    let mut v3_conversations = Vec::new();
    let mut v3_templates = Vec::new();
    let mut v3_prompts = Vec::new();
    for SqlConversationV1 {
        id,
        folder_id,
        path,
        title,
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
        info,
        prompt,
    } in v1_conversations
    {
        let template = SqlConversationTemplate {
            id,
            name: title.clone(),
            icon: icon.clone(),
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
            description: info.clone(),
        };
        v3_templates.push(template);
        let conversation = SqlConversation {
            id,
            folder_id,
            path,
            title,
            icon,
            created_time,
            updated_time,
            info,
            template_id: id,
        };
        v3_conversations.push(conversation);
        if let Some(prompt) = prompt {
            let prompt = SqlNewConversationTemplatePrompt {
                template_id: id,
                prompt,
                created_time,
                updated_time,
                role: (Role::System).to_string(),
            };
            v3_prompts.push(prompt);
        }
    }
    (v3_conversations, v3_templates, v3_prompts)
}

pub(in crate::store) fn v2_to_v3(
    v2_conn: &mut SqliteConnection,
    v3_conn: &mut SqliteConnection,
) -> ChatGPTResult<()> {
    v3_conn.batch_execute(CREATE_TABLE_SQL)?;
    // get all data from v2
    let AllDataV2 {
        conversations,
        folders,
        messages,
        conversation_template_prompts,
        conversation_templates,
    } = v2::AllDataV2::new(v2_conn)?;
    // migrate folders
    let v3_folders = folders.into_iter().map(SqlFolder::from).collect::<Vec<_>>();
    SqlFolder::migration_save(v3_folders, v3_conn)?;

    // migrate conversation templates
    let v3_templates = conversation_templates
        .into_iter()
        .map(SqlConversationTemplate::from)
        .collect::<Vec<_>>();
    SqlConversationTemplate::migration_save(v3_templates, v3_conn)?;

    // migrate conversation template prompts
    let v3_prompts = conversation_template_prompts
        .into_iter()
        .map(SqlConversationTemplatePrompt::from)
        .collect::<Vec<_>>();
    SqlConversationTemplatePrompt::migration_save(v3_prompts, v3_conn)?;

    // migrate conversations
    let v3_conversations = conversations
        .into_iter()
        .map(SqlConversation::from)
        .collect::<Vec<_>>();
    SqlConversation::migration_save(v3_conversations, v3_conn)?;

    // migrate messages
    let v3_messages = messages
        .into_iter()
        .map(SqlMessage::from)
        .collect::<Vec<_>>();
    SqlMessage::migration_save(v3_messages, v3_conn)?;
    Ok(())
}
