use serde::{Deserialize, Deserializer, Serializer};
use time::{OffsetDateTime, format_description::well_known::Rfc3339};

pub fn serialize_offset_date_time<S>(
    date: &OffsetDateTime,
    serializer: S,
) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    let s = date.format(&Rfc3339).map_err(serde::ser::Error::custom)?; // ISO 8601 format
    serializer.serialize_str(&s)
}

pub fn deserialize_offset_date_time<'de, D>(deserializer: D) -> Result<OffsetDateTime, D::Error>
where
    D: Deserializer<'de>,
{
    let s = String::deserialize(deserializer)?;
    OffsetDateTime::parse(&s, &Rfc3339).map_err(serde::de::Error::custom)
}
