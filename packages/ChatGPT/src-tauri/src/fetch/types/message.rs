use serde::{Deserialize, Serialize};

use crate::store::{Message as StoreMessage, Mode};
use crate::store::{Role, Status};

#[derive(Debug, Deserialize, Serialize)]
pub struct Message {
    pub role: Role,
    pub content: String,
}

impl Message {
    pub fn from_conversation(
        StoreMessage {
            role,
            content,
            status,
            ..
        }: StoreMessage,
        mode: Mode,
    ) -> Option<Self> {
        match mode {
            Mode::Contextual => match status {
                crate::store::Status::Normal => Some(Self { role, content }),
                crate::store::Status::Hidden => None,
                Status::Loading => None,
                Status::Error => None,
            },
            Mode::Single => None,
            Mode::AssistantOnly => match (role, status) {
                (Role::Assistant, Status::Normal) => Some(Self { role, content }),
                _ => None,
            },
        }
    }
    pub fn new(role: Role, content: String) -> Self {
        Self { role, content }
    }
}
