use crate::{
    error::{ClipError, ClipResult},
    store::{model::ClipboardType, model::HistoryModel},
};
use ciborium::{from_reader, into_writer};
use diesel::SqliteConnection;
use time::OffsetDateTime;

#[derive(serde::Serialize, serde::Deserialize, PartialEq, Eq, Debug)]
#[serde(tag = "tag", content = "value")]
pub enum HistoryData {
    Text {
        text: String,
        #[serde(rename = "wordCount")]
        word_count: usize,
        #[serde(rename = "charCount")]
        char_count: usize,
    },
    Image {
        #[serde(with = "serde_bytes")]
        data: Vec<u8>,
        width: u32,
        height: u32,
        size: usize,
    },
    Files(Vec<String>),
    Rtf {
        text: String,
        #[serde(rename = "plainText")]
        plain_text: String,
        #[serde(rename = "wordCount")]
        word_count: usize,
        #[serde(rename = "charCount")]
        char_count: usize,
    },
    Html {
        text: String,
        #[serde(rename = "plainText")]
        plain_text: String,
        #[serde(rename = "wordCount")]
        word_count: usize,
        #[serde(rename = "charCount")]
        char_count: usize,
    },
}

impl From<&HistoryData> for ClipboardType {
    fn from(value: &HistoryData) -> Self {
        match value {
            HistoryData::Text { .. } => ClipboardType::Text,
            HistoryData::Image { .. } => ClipboardType::Image,
            HistoryData::Files(_) => ClipboardType::Files,
            HistoryData::Rtf { .. } => ClipboardType::Rtf,
            HistoryData::Html { .. } => ClipboardType::Html,
        }
    }
}

#[derive(serde::Serialize, Debug)]
pub struct History {
    id: i32,
    pub(crate) data: HistoryData,
    #[serde(rename = "updateTime")]
    update_time: i64,
}

impl TryFrom<HistoryModel> for History {
    type Error = ClipError;

    fn try_from(value: HistoryModel) -> Result<Self, Self::Error> {
        let data = from_reader(value.data.as_slice())?;
        Ok(History {
            id: value.id,
            data,
            update_time: value.update_time,
        })
    }
}

impl History {
    ///如果没有相同数据插入，有的话更新时间
    pub fn insert_or_update(data: &HistoryData, conn: &mut SqliteConnection) -> ClipResult<()> {
        let time = OffsetDateTime::now_utc().unix_timestamp();
        let r#type = ClipboardType::from(data);
        let mut bytes = Vec::new();
        into_writer(data, &mut bytes)?;
        let old_data = HistoryModel::find_by_data(&bytes, conn)?;
        match old_data {
            Some(_) => HistoryModel::update_time_by_data(&bytes, time, conn),
            None => HistoryModel::create(&bytes, r#type, time, conn),
        }
    }
    /// 根据数据获取历史记录
    pub fn query(
        search_name: Option<&str>,
        clipboard_type: Option<ClipboardType>,
        conn: &mut SqliteConnection,
    ) -> ClipResult<Vec<Self>> {
        let data: Vec<History> = match clipboard_type {
            Some(clipboard_type) => HistoryModel::query_by_type(clipboard_type, conn)?,
            None => HistoryModel::query_all(conn)?,
        }
        .into_iter()
        .map(TryFrom::try_from)
        .collect::<Result<_, _>>()?;
        match search_name {
            Some(search_name) => Ok(data
                .into_iter()
                .filter(|History { data, .. }| match data {
                    HistoryData::Text { text, .. } => text.contains(search_name),
                    HistoryData::Image { .. } => false,
                    HistoryData::Files(items) => {
                        items.iter().any(|item| item.contains(search_name))
                    }
                    HistoryData::Rtf {
                        text, plain_text, ..
                    }
                    | HistoryData::Html {
                        text, plain_text, ..
                    } => text.contains(search_name) || plain_text.contains(search_name),
                })
                .collect()),
            None => Ok(data),
        }
    }
    /// 根据 id 获取
    pub fn find_by_id(id: i32, conn: &mut SqliteConnection) -> ClipResult<Self> {
        let data = HistoryModel::find_by_id(id, conn)?;
        data.try_into()
    }
}
