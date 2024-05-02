use diesel::prelude::*;
use time::OffsetDateTime;

use crate::store::schema::temporary_conversations;

#[derive(Queryable, AsChangeset, Debug, Insertable)]
#[diesel(table_name = temporary_conversations)]
pub struct SqlTemporaryConversation {
    pub(in super::super) id: i32,
    pub(in super::super) created_time: OffsetDateTime,
    pub(in super::super) updated_time: OffsetDateTime,
    pub(in super::super) template_id: i32,
    pub(in super::super) hotkeys: String,
}
