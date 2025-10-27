use crate::{
    error::{ClipError, ClipResult},
    store::{model::ClipboardType, model::HistoryModel},
};
use ciborium::from_reader;
use diesel::SqliteConnection;
use std::io::Cursor;
use time::OffsetDateTime;
use unicode_segmentation::UnicodeSegmentation;

#[derive(serde::Serialize)]
#[serde(tag = "tag", content = "value", rename_all = "camelCase")]
pub enum HistoryData {
    Text {
        data: String,
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
        data: String,
        #[serde(rename = "wordCount")]
        word_count: usize,
        #[serde(rename = "charCount")]
        char_count: usize,
    },
    Html {
        data: String,
        #[serde(rename = "wordCount")]
        word_count: usize,
        #[serde(rename = "charCount")]
        char_count: usize,
    },
}

#[derive(serde::Serialize)]
pub struct History {
    id: i32,
    pub(crate) data: HistoryData,
    #[serde(rename = "updateTime")]
    update_time: i64,
}

impl TryFrom<HistoryModel> for History {
    type Error = ClipError;

    fn try_from(value: HistoryModel) -> Result<Self, Self::Error> {
        let clipboard_type: ClipboardType = value.type_.parse()?;
        fn get_text_info(data: &[u8]) -> Result<(String, usize, usize), ClipError> {
            let text = String::from_utf8(data.to_vec())?;
            let char_count = text.graphemes(true).count();
            let word_count = text.unicode_words().count();
            Ok((text, char_count, word_count))
        }
        match clipboard_type {
            ClipboardType::Text => {
                let (text, char_count, word_count) = get_text_info(&value.data)?;
                Ok(History {
                    id: value.id,
                    data: HistoryData::Text {
                        data: text,
                        word_count,
                        char_count,
                    },
                    update_time: value.update_time,
                })
            }
            ClipboardType::Image => {
                let HistoryModel {
                    id,
                    data,
                    update_time,
                    ..
                } = value;
                let decoder = png::Decoder::new(Cursor::new(data.clone()));
                let reader = decoder.read_info()?;
                let info = reader.info();
                Ok(History {
                    id,
                    data: HistoryData::Image {
                        size: data.len(),
                        data,
                        width: info.width,
                        height: info.height,
                    },
                    update_time,
                })
            }
            ClipboardType::Files => {
                let HistoryModel {
                    id,
                    data,
                    update_time,
                    ..
                } = value;
                let files = from_reader(data.as_slice())?;
                Ok(History {
                    id,
                    data: HistoryData::Files(files),
                    update_time,
                })
            }
            ClipboardType::Rtf => {
                let (data, word_count, char_count) = get_text_info(&value.data)?;
                Ok(History {
                    id: value.id,
                    data: HistoryData::Rtf {
                        data,
                        word_count,
                        char_count,
                    },
                    update_time: value.update_time,
                })
            }
            ClipboardType::Html => {
                let (data, word_count, char_count) = get_text_info(&value.data)?;
                Ok(History {
                    id: value.id,
                    data: HistoryData::Html {
                        data,
                        word_count,
                        char_count,
                    },
                    update_time: value.update_time,
                })
            }
        }
    }
}

impl History {
    ///如果没有相同数据插入，有的话更新时间
    pub fn insert_or_update(
        data: &[u8],
        r#type: ClipboardType,
        conn: &mut SqliteConnection,
    ) -> ClipResult<()> {
        let time = OffsetDateTime::now_utc().unix_timestamp();
        let old_data = HistoryModel::find_by_data(data, conn)?;
        match old_data {
            Some(_) => HistoryModel::update_time_by_data(data, time, conn),
            None => HistoryModel::create(data, r#type, time, conn),
        }
    }
    /// 根据数据获取历史记录
    pub fn query(search_name: Option<&[u8]>, conn: &mut SqliteConnection) -> ClipResult<Vec<Self>> {
        let data = HistoryModel::query_all(conn)?;
        match search_name {
            Some(search_name) => data
                .into_iter()
                .filter(|HistoryModel { data, .. }| {
                    data.windows(search_name.len())
                        .any(|window| window == search_name)
                })
                .map(TryFrom::try_from)
                .collect(),
            None => data.into_iter().map(TryFrom::try_from).collect(),
        }
    }
    /// 根据 id 获取
    pub fn find_by_id(id: i32, conn: &mut SqliteConnection) -> ClipResult<Self> {
        let data = HistoryModel::find_by_id(id, conn)?;
        data.try_into()
    }
}
