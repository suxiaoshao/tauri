/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-24 19:32:30
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 01:12:22
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/store/migrations/mod.rs
 */
use crate::{
    adapter::{Adapter, OpenAIConversationTemplate, OpenAIStreamAdapter},
    errors::ChatGPTResult,
    store::{
        migrations::v1::AllDataV1,
        model::{SqlFolder, SqlMessage},
    },
};

use diesel::{SqliteConnection, connection::SimpleConnection};
use v2::{AllDataV2, SqlConversationTemplatePromptV2, SqlConversationTemplateV2};

use self::v1::SqlConversationV1;

use super::{
    CREATE_TABLE_SQL, Role,
    model::{SqlConversation, SqlConversationTemplate},
    service::ConversationTemplatePrompt,
};

pub(super) mod v1;
pub(super) mod v2;

pub(in crate::store) fn v1_to_v3(
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
    let (target_conversations, target_templates) = get_conversations_from_v1(conversations)?;
    SqlConversationTemplate::migration_save(target_templates, target_conn)?;
    SqlConversation::migration_save(target_conversations, target_conn)?;

    // migrate messages
    let target_messages = messages
        .into_iter()
        .map(SqlMessage::from)
        .collect::<Vec<_>>();
    SqlMessage::migration_save(target_messages, target_conn)?;
    Ok(())
}

fn get_conversations_from_v1(
    v1_conversations: Vec<SqlConversationV1>,
) -> ChatGPTResult<(Vec<SqlConversation>, Vec<SqlConversationTemplate>)> {
    let mut target_conversations = Vec::new();
    let mut target_templates = Vec::new();
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
        let template = SqlConversationTemplate {
            id,
            name: title.clone(),
            icon: icon.clone(),
            mode,
            created_time,
            updated_time,
            description: info.clone(),
            adapter: OpenAIStreamAdapter::NAME.to_string(),
            template: serde_json::to_string(&OpenAIConversationTemplate {
                model,
                temperature,
                top_p,
                n: n as u32,
                presence_penalty,
                frequency_penalty,
                max_completion_tokens: max_tokens.map(|x| x as u32),
            })?,
            prompts: serde_json::to_string(&match prompt {
                Some(prompt) => vec![ConversationTemplatePrompt {
                    prompt,
                    role: Role::System,
                }],
                None => vec![],
            })?,
        };
        target_templates.push(template);
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
        target_conversations.push(conversation);
    }
    Ok((target_conversations, target_templates))
}

pub(in crate::store) fn v2_to_v3(
    v2_conn: &mut SqliteConnection,
    target_conn: &mut SqliteConnection,
) -> ChatGPTResult<()> {
    target_conn.batch_execute(CREATE_TABLE_SQL)?;
    // get all data from v1
    let AllDataV2 {
        conversations,
        folders,
        messages,
        conversation_templates,
        conversation_template_prompts,
    } = v2::AllDataV2::new(v2_conn)?;

    // migrate folders
    let target_folders = folders.into_iter().map(SqlFolder::from).collect::<Vec<_>>();
    SqlFolder::migration_save(target_folders, target_conn)?;

    // migrate conversations_templates
    let target_templates =
        get_conversations_from_v2(conversation_templates, conversation_template_prompts)?;
    SqlConversationTemplate::migration_save(target_templates, target_conn)?;

    // migrate conversation
    let target_conversations = conversations
        .into_iter()
        .map(SqlConversation::from)
        .collect::<Vec<_>>();
    SqlConversation::migration_save(target_conversations, target_conn)?;

    // migrate messages
    let target_messages = messages
        .into_iter()
        .map(SqlMessage::from)
        .collect::<Vec<_>>();
    SqlMessage::migration_save(target_messages, target_conn)?;

    Ok(())
}

fn get_conversations_from_v2(
    v2_templates: Vec<SqlConversationTemplateV2>,
    v2_prompts: Vec<SqlConversationTemplatePromptV2>,
) -> ChatGPTResult<Vec<SqlConversationTemplate>> {
    let mut templates = vec![];
    for SqlConversationTemplateV2 {
        id,
        icon,
        created_time,
        updated_time,
        name,
        description,
        mode,
        model,
        temperature,
        top_p,
        n,
        max_tokens,
        presence_penalty,
        frequency_penalty,
    } in v2_templates
    {
        let prompts = v2_prompts
            .iter()
            .filter(|prompt| prompt.template_id == id)
            .map(|prompt| ConversationTemplatePrompt {
                prompt: prompt.prompt.clone(),
                role: Role::System,
            })
            .collect::<Vec<_>>();

        let template = SqlConversationTemplate {
            id,
            icon,
            created_time,
            updated_time,
            name,
            description,
            mode,
            adapter: OpenAIStreamAdapter::NAME.to_string(),
            template: serde_json::to_string(&OpenAIConversationTemplate {
                model,
                temperature,
                top_p,
                n: n as u32,
                presence_penalty,
                frequency_penalty,
                max_completion_tokens: max_tokens.map(|x| x as u32),
            })?,
            prompts: serde_json::to_string(&prompts)?,
        };
        templates.push(template);
    }
    Ok(templates)
}
