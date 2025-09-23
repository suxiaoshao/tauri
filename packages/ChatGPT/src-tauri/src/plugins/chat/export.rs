use crate::{
    errors::ChatGPTResult,
    store::{self, Conversation, DbConn, Message},
};
use std::{fmt::Display, fs::File, io::Write, path::PathBuf};

#[derive(Debug, Clone, Copy, PartialEq, serde::Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ExportType {
    Json,
    Csv,
    Txt,
}

impl Display for ExportType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let s = match self {
            ExportType::Json => "json",
            ExportType::Csv => "csv",
            ExportType::Txt => "txt",
        };
        write!(f, "{s}")
    }
}

#[tauri::command]
pub async fn export(
    state: tauri::State<'_, DbConn>,
    id: i32,
    export_type: ExportType,
    path: PathBuf,
) -> ChatGPTResult<()> {
    let conn = &mut state.get()?;
    let Conversation {
        messages, title, ..
    } = store::Conversation::find(id, conn)?;
    let file = create_unique_file(path, &title, export_type)?;
    match export_type {
        ExportType::Json => export_json(messages, file)?,
        ExportType::Csv => export_csv(messages, file)?,
        ExportType::Txt => export_txt(messages, file)?,
    }
    Ok(())
}

pub fn create_unique_file(
    base_path: PathBuf,
    filename: &str,
    export_name: ExportType,
) -> ChatGPTResult<File> {
    // 确保目录存在
    if let Some(parent) = base_path.parent() {
        std::fs::create_dir_all(parent)?;
    }

    // 从 1 开始尝试，i == 1 时是最基础的 "{filename}.{export_name}"
    for i in 1.. {
        let name = if i == 1 {
            format!("{}.{}", filename, export_name)
        } else {
            format!("{}({}).{}", filename, i, export_name)
        };
        let candidate = base_path.join(&name);

        if !candidate.exists() {
            let file = File::create(candidate)?;
            return Ok(file);
        }
    }

    // 理论上不会到这里
    unreachable!("无限循环终止");
}

fn export_json(messages: Vec<Message>, file: File) -> ChatGPTResult<()> {
    serde_json::to_writer_pretty(file, &messages)?;
    Ok(())
}

fn export_csv(messages: Vec<Message>, file: File) -> ChatGPTResult<()> {
    let mut wtr = csv::Writer::from_writer(file);
    for message in messages {
        wtr.serialize((
            message.id,
            message.conversation_id,
            message.role,
            serde_json::to_string(&message.content)?,
            message.status,
            message.start_time,
            message.end_time,
            message.created_time,
            message.updated_time,
        ))?;
    }
    wtr.flush()?;
    Ok(())
}
fn export_txt(messages: Vec<Message>, mut file: File) -> ChatGPTResult<()> {
    for message in messages {
        writeln!(
            &mut file,
            "{}: {}",
            message.role,
            serde_json::to_string(&message.content)?
        )?;
    }
    Ok(())
}

#[cfg(test)]
mod test {
    use std::fs::File;

    use diesel::{Connection, SqliteConnection};

    use crate::{
        errors::ChatGPTResult,
        store::{self, Content, NewMessage, init_tables},
    };

    #[test]
    fn test_export_csv() -> ChatGPTResult<()> {
        let conn = &mut establish_connection()?;
        let new_message = NewMessage {
            conversation_id: 1,
            role: store::Role::User,
            content: Content::Text("test".to_owned()),
            status: store::Status::Normal,
        };
        store::Message::insert(new_message, conn)?;
        let messages = store::Message::messages_by_conversation_id(1, conn)?;
        let file = File::create("test.csv")?;
        super::export_csv(messages, file)?;
        std::fs::remove_file("test.csv")?;
        Ok(())
    }
    pub fn establish_connection() -> ChatGPTResult<SqliteConnection> {
        let mut conn = SqliteConnection::establish("file::memory:")?;
        init_tables(&mut conn)?;
        Ok(conn)
    }
}
