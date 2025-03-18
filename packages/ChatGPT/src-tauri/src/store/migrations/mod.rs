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

use diesel::{SqliteConnection, connection::SimpleConnection};

use self::v1::SqlConversationV1;

use super::{
    CREATE_TABLE_SQL, Role,
    model::{SqlConversation, SqlConversationTemplate},
};

pub(super) mod v1;
pub(super) mod v2;

pub(in crate::store) fn v1_to_v2(
    v1_conn: &mut SqliteConnection,
    target_conn: &mut SqliteConnection,
) -> ChatGPTResult<()> {
    target_conn.batch_execute(CREATE_TABLE_SQL)?;
    // get all data from v1
    let AllDataV1 {
        conversations,
        folders,
        messages,
    } = v1::AllDataV1::new(v1_conn)?;
    // migrate folders
    let target_folders = folders.into_iter().map(SqlFolder::from).collect::<Vec<_>>();
    SqlFolder::migration_save(target_folders, target_conn)?;

    // migrate conversations
    let (target_conversations, target_templates) = get_conversations(conversations);
    SqlConversationTemplate::migration_save(target_templates, target_conn)?;
    SqlConversation::migration_save(target_conversations, target_conn)?;
    todo!();
    // SqlNewConversationTemplatePrompt::save_many(target_prompts, target_conn)?;

    // migrate messages
    let target_messages = messages
        .into_iter()
        .map(SqlMessage::from)
        .collect::<Vec<_>>();
    SqlMessage::migration_save(target_messages, target_conn)?;
    Ok(())
}

fn get_conversations(
    v1_conversations: Vec<SqlConversationV1>,
) -> (Vec<SqlConversation>, Vec<SqlConversationTemplate>) {
    let mut target_conversations = Vec::new();
    let mut target_templates = Vec::new();
    todo!();
    // let mut target_prompts = Vec::new();
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
        todo!()
        // let template = SqlConversationTemplate {
        //     id,
        //     name: title.clone(),
        //     icon: icon.clone(),
        //     mode,
        //     model,
        //     temperature,
        //     top_p,
        //     n,
        //     max_tokens,
        //     presence_penalty,
        //     frequency_penalty,
        //     created_time,
        //     updated_time,
        //     description: info.clone(),
        // };
        // target_templates.push(template);
        // let conversation = SqlConversation {
        //     id,
        //     folder_id,
        //     path,
        //     title,
        //     icon,
        //     created_time,
        //     updated_time,
        //     info,
        //     template_id: id,
        // };
        // target_conversations.push(conversation);
        // if let Some(prompt) = prompt {
        //     let prompt = SqlNewConversationTemplatePrompt {
        //         template_id: id,
        //         prompt,
        //         created_time,
        //         updated_time,
        //         role: (Role::System).to_string(),
        //     };
        //     target_prompts.push(prompt);
        // }
    }
    (target_conversations, target_templates)
}
