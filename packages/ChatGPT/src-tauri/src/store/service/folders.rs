use diesel::SqliteConnection;
use serde::{Deserialize, Serialize};
use time::OffsetDateTime;

use crate::{
    errors::{ChatGPTError, ChatGPTResult},
    store::{
        model::{
            conversations::SqlConversation,
            folders::{SqlFolder, SqlNewFolder, SqlUpdateFolder},
            messages::SqlMessage,
        },
        Conversation, Message,
    },
};

#[derive(Serialize)]
pub struct Folder {
    pub id: i32,
    pub name: String,
    pub path: String,
    #[serde(rename = "parentId")]
    pub parent_id: Option<i32>,
    #[serde(rename = "createdTime")]
    pub created_time: OffsetDateTime,
    #[serde(rename = "updatedTime")]
    pub updated_time: OffsetDateTime,
    pub conversations: Vec<Conversation>,
    pub folders: Vec<Folder>,
}

impl Folder {
    pub fn insert(
        NewFolder { name, parent_id }: NewFolder,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<()> {
        let now = OffsetDateTime::now_utc();
        let parent_folder = parent_id
            .map(|folder_id| SqlFolder::find(folder_id, conn))
            .transpose()?;
        let path = match parent_folder {
            Some(parent_folder) => format!("{}/{}", parent_folder.path, name),
            None => format!("/{}", name),
        };
        if SqlFolder::path_exists(&path, conn)? {
            return Err(ChatGPTError::FolderPathExists(path));
        }
        if SqlConversation::path_exists(&path, conn)? {
            return Err(ChatGPTError::ConversationPathExists(path));
        }
        let new_folder = SqlNewFolder {
            name,
            path,
            parent_id,
            created_time: now,
            updated_time: now,
        };
        new_folder.insert(conn)?;
        Ok(())
    }
    pub fn update(
        id: i32,
        NewFolder { name, parent_id }: NewFolder,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<()> {
        let now = OffsetDateTime::now_utc();
        let parent_folder = parent_id
            .map(|folder_id| SqlFolder::find(folder_id, conn))
            .transpose()?;
        let old_folder = SqlFolder::find(id, conn)?;
        let path = match parent_folder {
            Some(parent_folder) => format!("{}/{}", parent_folder.path, name),
            None => format!("/{}", name),
        };

        let path_updated = old_folder.path != path;
        if path_updated && SqlFolder::path_exists(&path, conn)? {
            return Err(ChatGPTError::FolderPathExists(path));
        }
        if SqlConversation::path_exists(&path, conn)? {
            return Err(ChatGPTError::ConversationPathExists(path));
        }
        let update_folder = SqlUpdateFolder {
            id,
            path: path.clone(),
            name,
            parent_id,
            updated_time: now,
        };
        conn.immediate_transaction::<_, ChatGPTError, _>(move |conn| {
            update_folder.update(conn)?;
            if path_updated {
                Self::update_path(&old_folder.path, &path, conn)?;
                Conversation::update_path(&old_folder.path, &path, conn)?;
                Message::update_path(&old_folder.path, &path, conn)?;
            }
            Ok(())
        })?;

        Ok(())
    }
    pub fn query(conn: &mut SqliteConnection) -> ChatGPTResult<Vec<Self>> {
        let sql_folders = SqlFolder::query(conn)?;
        sql_folders
            .into_iter()
            .map(|sql_folder| Self::from_sql_folder(sql_folder, conn))
            .collect()
    }
    fn from_sql_folder(
        SqlFolder {
            id,
            path,
            name,
            parent_id,
            created_time,
            updated_time,
        }: SqlFolder,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<Self> {
        let conversations = Conversation::find_by_folder_id(id, conn)?;
        let folders = Self::find_by_parent_id(id, conn)?;
        Ok(Self {
            id,
            name,
            path,
            parent_id,
            created_time,
            updated_time,
            conversations,
            folders,
        })
    }
    fn find_by_parent_id(parent_id: i32, conn: &mut SqliteConnection) -> ChatGPTResult<Vec<Self>> {
        let sql_folders = SqlFolder::query_by_parent_id(parent_id, conn)?;
        sql_folders
            .into_iter()
            .map(|sql_folder| Self::from_sql_folder(sql_folder, conn))
            .collect()
    }
    pub fn delete_by_id(id: i32, conn: &mut SqliteConnection) -> ChatGPTResult<()> {
        conn.immediate_transaction::<_, ChatGPTError, _>(|conn| {
            let folder = SqlFolder::find(id, conn)?;
            SqlMessage::delete_by_path(&folder.path, conn)?;
            SqlConversation::delete_by_path(&folder.path, conn)?;
            SqlFolder::delete_by_path(&folder.path, conn)?;
            SqlFolder::delete_by_id(id, conn)?;
            Ok(())
        })?;
        Ok(())
    }
    pub fn update_path(
        old_path_pre: &str,
        new_path_pre: &str,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<()> {
        let update_list = SqlFolder::find_by_path_pre(old_path_pre, conn)?;
        let time = OffsetDateTime::now_utc();
        update_list
            .into_iter()
            .map(|old| SqlUpdateFolder::from_new_path(old, old_path_pre, new_path_pre, time))
            .try_for_each(|update| {
                update.update(conn)?;
                Ok::<(), ChatGPTError>(())
            })?;
        Ok(())
    }
    pub fn move_folder(
        id: i32,
        new_parent_id: Option<i32>,
        conn: &mut SqliteConnection,
    ) -> ChatGPTResult<()> {
        let SqlFolder {
            parent_id: old_parent_id,
            mut path,
            ..
        } = SqlFolder::find(id, conn)?;
        let old_path = path.clone();
        let old_path_pre = match old_parent_id {
            Some(parent_id) => {
                let SqlFolder { path, .. } = SqlFolder::find(parent_id, conn)?;
                path
            }
            _ => "/".to_string(),
        };
        let new_path_pre = match new_parent_id {
            Some(parent_id) => {
                let SqlFolder { path, .. } = SqlFolder::find(parent_id, conn)?;
                path
            }
            _ => "/".to_string(),
        };
        path.replace_range(0..old_path_pre.len(), &new_path_pre);
        conn.immediate_transaction::<_, ChatGPTError, _>(|conn| {
            let time = OffsetDateTime::now_utc();
            SqlUpdateFolder::move_folder(id, new_parent_id, &path, time, conn)?;
            Self::update_path(&old_path, &path, conn)?;
            Conversation::update_path(&old_path, &path, conn)?;
            Message::update_path(&old_path, &path, conn)?;
            Ok(())
        })?;
        Ok(())
    }
}

#[derive(Deserialize)]
pub struct NewFolder {
    name: String,
    #[serde(rename = "parentId")]
    parent_id: Option<i32>,
}
