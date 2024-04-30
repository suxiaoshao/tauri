use std::{fmt::Display, io::Write, path::PathBuf};

use crate::{
    errors::ChatGPTResult,
    store::{self, Conversation, DbConn, Message},
};

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
        write!(f, "{}", s)
    }
}

#[tauri::command]
pub async fn export(
    state: tauri::State<'_, DbConn>,
    id: i32,
    export_type: ExportType,
    mut path: PathBuf,
) -> ChatGPTResult<()> {
    let conn = &mut state.get()?;
    let Conversation {
        messages, title, ..
    } = store::Conversation::find(id, conn)?;
    path.push(format!("{}.{}", title, export_type));
    match export_type {
        ExportType::Json => export_json(messages, path)?,
        ExportType::Csv => export_csv(messages, path)?,
        ExportType::Txt => export_txt(messages, path)?,
    }
    Ok(())
}

fn export_json(messages: Vec<Message>, path: PathBuf) -> ChatGPTResult<()> {
    let file = std::fs::File::create(path)?;
    serde_json::to_writer_pretty(file, &messages)?;
    Ok(())
}

fn export_csv(messages: Vec<Message>, path: PathBuf) -> ChatGPTResult<()> {
    let file = std::fs::File::create(path)?;
    let mut wtr = csv::Writer::from_writer(file);
    for message in messages {
        wtr.serialize(message)?;
    }
    wtr.flush()?;
    Ok(())
}
fn export_txt(messages: Vec<Message>, path: PathBuf) -> ChatGPTResult<()> {
    let mut file = std::fs::File::create(path)?;
    for message in messages {
        writeln!(&mut file, "{}: {}", message.role, message.content)?;
    }
    Ok(())
}

#[cfg(test)]
mod test {
    use diesel::{Connection, SqliteConnection};

    use crate::{
        errors::ChatGPTResult,
        store::{self, create_tables, NewMessage},
    };

    #[test]
    fn test_export_csv() -> ChatGPTResult<()> {
        let conn = &mut establish_connection()?;
        let new_message = NewMessage {
            conversation_id: 1,
            role: store::Role::User,
            content: "test".to_owned(),
            status: store::Status::Normal,
        };
        store::Message::insert(new_message, conn)?;
        let messages = store::Message::messages_by_conversation_id(1, conn)?;
        let path = std::path::PathBuf::from("test.csv");
        super::export_csv(messages, path)?;
        std::fs::remove_file("test.csv")?;
        Ok(())
    }
    pub fn establish_connection() -> ChatGPTResult<SqliteConnection> {
        let mut conn = SqliteConnection::establish("file::memory:")?;
        create_tables(&mut conn)?;
        Ok(conn)
    }
}
