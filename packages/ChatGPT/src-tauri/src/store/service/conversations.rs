use diesel::SqliteConnection;
use time::OffsetDateTime;

use crate::{
    errors::{ChatGPTError, ChatGPTResult},
    store::{
        model::{
            conversations::{SqlConversation, SqlNewConversation, SqlUpdateConversation},
            folders::SqlFolder,
            messages::SqlMessage,
        },
        Message, Mode,
    },
};

use super::utils::serialize_offset_date_time;

#[derive(serde::Serialize)]
pub struct Conversation {
    pub id: i32,
    pub path: String,
    #[serde(rename = "folderId")]
    pub folder_id: Option<i32>,
    pub title: String,
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
    pub info: Option<String>,
    pub prompt: Option<String>,
    pub messages: Vec<Message>,
}

#[derive(serde::Deserialize, Debug)]
pub struct NewConversation {
    title: String,
    #[serde(rename = "folderId")]
    folder_id: Option<i32>,
    icon: String,
    mode: Mode,
    model: String,
    temperature: f64,
    #[serde(rename = "topP")]
    top_p: f64,
    n: i64,
    #[serde(rename = "maxTokens")]
    max_tokens: Option<i64>,
    #[serde(rename = "presencePenalty")]
    presence_penalty: f64,
    #[serde(rename = "frequencyPenalty")]
    frequency_penalty: f64,
    info: Option<String>,
    prompt: Option<String>,
    template_id: i32,
}

impl Conversation {
    pub fn find(id: i32, conn: &mut SqliteConnection) -> ChatGPTResult<Self> {
        let sql_conversation = SqlConversation::find(id, conn)?;
        Self::from_sql_conversation(sql_conversation, conn)
    }
    pub fn insert(
        NewConversation {
            title,
            folder_id,
            icon,
            mode,
            model,
            temperature,
            top_p,
            n,
            max_tokens,
            presence_penalty,
            frequency_penalty,
            info,
            prompt,
            template_id,
        }: NewConversation,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<()> {
        let time = OffsetDateTime::now_utc();
        let folder = folder_id
            .map(|folder_id| SqlFolder::find(folder_id, conn))
            .transpose()?;
        let path = match folder {
            Some(folder) => format!("{}/{}", folder.path, title),
            None => format!("/{}", title),
        };
        if SqlFolder::path_exists(&path, conn)? {
            return Err(ChatGPTError::FolderPathExists(path));
        }
        if SqlConversation::path_exists(&path, conn)? {
            return Err(ChatGPTError::ConversationPathExists(path));
        }
        let sql_new = SqlNewConversation {
            title,
            path,
            folder_id,
            icon,
            info,
            created_time: time,
            updated_time: time,
            template_id,
        };
        sql_new.insert(conn)?;
        Ok(())
    }
    /// 获取没有文件夹的会话
    pub fn query_without_folder(conn: &mut SqliteConnection) -> ChatGPTResult<Vec<Conversation>> {
        let data = SqlConversation::query_without_folder(conn)?;
        data.into_iter()
            .map(|sql_conversation| Self::from_sql_conversation(sql_conversation, conn))
            .collect::<ChatGPTResult<_>>()
    }
    fn from_sql_conversation(
        SqlConversation {
            id,
            path,
            folder_id,
            title,
            icon,
            created_time,
            updated_time,
            info,
            template_id,
        }: SqlConversation,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<Conversation> {
        let messages = Message::messages_by_conversation_id(id, conn)?;
        todo!();
        // Ok(Conversation {
        //     id,
        //     path,
        //     folder_id,
        //     title,
        //     icon,
        //     mode: mode.parse()?,
        //     model,
        //     temperature,
        //     top_p,
        //     n,
        //     max_tokens,
        //     presence_penalty,
        //     frequency_penalty,
        //     created_time,
        //     updated_time,
        //     info,
        //     prompt,
        //     messages,
        // })
    }
    pub fn update(
        id: i32,
        NewConversation {
            title,
            folder_id,
            icon,
            mode,
            model,
            temperature,
            top_p,
            n,
            max_tokens,
            presence_penalty,
            frequency_penalty,
            info,
            prompt,
            template_id,
        }: NewConversation,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<()> {
        let time = OffsetDateTime::now_utc();
        let folder = folder_id
            .map(|folder_id| SqlFolder::find(folder_id, conn))
            .transpose()?;
        let old_conversation = SqlConversation::find(id, conn)?;
        let path = match folder {
            Some(folder) => format!("{}/{}", folder.path, title),
            None => format!("/{}", title),
        };
        if SqlFolder::path_exists(&path, conn)? {
            return Err(ChatGPTError::FolderPathExists(path));
        }
        let path_updated = old_conversation.path != path;
        if path_updated && SqlConversation::path_exists(&path, conn)? {
            return Err(ChatGPTError::ConversationPathExists(path));
        }
        let update = SqlUpdateConversation {
            id,
            path: path.clone(),
            title,
            folder_id,
            icon,
            updated_time: time,
            info,
        };
        conn.immediate_transaction(|conn| {
            update.update(conn)?;
            if path_updated {
                SqlMessage::move_folder(id, &path, time, conn)?;
            }
            Ok::<(), ChatGPTError>(())
        })?;
        Ok(())
    }
    pub fn find_by_folder_id(
        folder_id: i32,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<Vec<Conversation>> {
        let data = SqlConversation::find_by_folder_id(folder_id, conn)?;
        data.into_iter()
            .map(|sql_conversation| Self::from_sql_conversation(sql_conversation, conn))
            .collect::<ChatGPTResult<_>>()
    }
    pub fn delete_by_id(id: i32, conn: &mut SqliteConnection) -> ChatGPTResult<()> {
        conn.immediate_transaction(|conn| {
            SqlMessage::delete_by_conversation_id(id, conn)?;
            SqlConversation::delete_by_id(id, conn)?;
            Ok::<(), ChatGPTError>(())
        })?;
        Ok(())
    }
    pub fn update_path(
        old_path_pre: &str,
        new_path_pre: &str,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<()> {
        let update_list = SqlConversation::find_by_path_pre(old_path_pre, conn)?;
        let time = OffsetDateTime::now_utc();
        update_list
            .into_iter()
            .map(|old| SqlUpdateConversation::from_new_path(old, old_path_pre, new_path_pre, time))
            .try_for_each(|update| {
                update.update(conn)?;
                Ok::<(), ChatGPTError>(())
            })?;
        Ok(())
    }
    pub fn move_folder(
        conversation_id: i32,
        new_folder_id: Option<i32>,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<()> {
        let SqlConversation {
            folder_id: old_folder_id,
            mut path,
            ..
        } = SqlConversation::find(conversation_id, conn)?;
        let old_path_pre = match old_folder_id {
            Some(folder_id) => {
                let SqlFolder { path, .. } = SqlFolder::find(folder_id, conn)?;
                path
            }
            _ => "/".to_string(),
        };
        let new_path_pre = match new_folder_id {
            Some(new_folder_id) => {
                let SqlFolder { path, .. } = SqlFolder::find(new_folder_id, conn)?;
                path
            }
            None => "/".to_string(),
        };
        path.replace_range(0..old_path_pre.len(), &new_path_pre);
        conn.immediate_transaction::<_, ChatGPTError, _>(|conn| {
            let time = OffsetDateTime::now_utc();
            SqlUpdateConversation::move_folder(conversation_id, new_folder_id, &path, time, conn)?;
            SqlMessage::move_folder(conversation_id, &path, time, conn)?;
            Ok(())
        })?;
        Ok(())
    }
    pub fn clear(id: i32, conn: &mut SqliteConnection) -> ChatGPTResult<()> {
        SqlMessage::delete_by_conversation_id(id, conn)?;
        Ok(())
    }
}
