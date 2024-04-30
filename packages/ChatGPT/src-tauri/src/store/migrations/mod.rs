/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-24 19:32:30
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-30 04:27:39
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/store/migrations/mod.rs
 */
use crate::{
    errors::ChatGPTResult,
    store::{
        migrations::v1::AllData,
        model::{folders::SqlFolder, messages::SqlMessage},
    },
};

use diesel::{connection::SimpleConnection, SqliteConnection};

use self::v1::SqlConversationV1;

use super::{
    model::{
        conversation_template_prompts::SqlNewConversationTemplatePrompt,
        conversation_templates::SqlConversationTemplate, conversations::SqlConversation,
    },
    Role, CREATE_TABLE_SQL,
};

pub(super) mod v1;

pub(in crate::store) fn v1_to_v2(
    v1_conn: &mut SqliteConnection,
    v2_conn: &mut SqliteConnection,
) -> ChatGPTResult<()> {
    v2_conn.batch_execute(CREATE_TABLE_SQL)?;
    // get all data from v1
    let AllData {
        conversations,
        folders,
        messages,
    } = v1::get_all_data(v1_conn)?;
    // migrate folders
    let v2_folders = folders.into_iter().map(SqlFolder::from).collect::<Vec<_>>();
    SqlFolder::migration_save(v2_folders, v2_conn)?;

    // migrate conversations
    let (v2_conversations, v2_templates, v2_prompts) = get_conversations(conversations);
    SqlConversationTemplate::migration_save(v2_templates, v2_conn)?;
    SqlConversation::migration_save(v2_conversations, v2_conn)?;
    SqlNewConversationTemplatePrompt::save_many(v2_prompts, v2_conn)?;

    // migrate messages
    let v2_messages = messages
        .into_iter()
        .map(SqlMessage::from)
        .collect::<Vec<_>>();
    SqlMessage::migration_save(v2_messages, v2_conn)?;
    Ok(())
}

fn get_conversations(
    v1_conversations: Vec<SqlConversationV1>,
) -> (
    Vec<SqlConversation>,
    Vec<SqlConversationTemplate>,
    Vec<SqlNewConversationTemplatePrompt>,
) {
    let mut v2_conversations = Vec::new();
    let mut v2_templates = Vec::new();
    let mut v2_prompts = Vec::new();
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
        };
        v2_templates.push(template);
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
        v2_conversations.push(conversation);
        if let Some(prompt) = prompt {
            let prompt = SqlNewConversationTemplatePrompt {
                template_id: id,
                prompt,
                created_time,
                updated_time,
                role: (Role::System).to_string(),
            };
            v2_prompts.push(prompt);
        }
    }
    (v2_conversations, v2_templates, v2_prompts)
}
