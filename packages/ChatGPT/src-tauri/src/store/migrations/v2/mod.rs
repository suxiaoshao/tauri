/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-01-06 01:08:42
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-04-30 04:30:49
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/store/model/mod.rs
 */
mod conversation_template_prompts;
mod conversation_templates;
mod conversations;
mod folders;
mod messages;
mod schema;

pub use conversation_template_prompts::SqlConversationTemplatePromptV2;
pub use conversation_templates::SqlConversationTemplateV2;
pub use conversations::SqlConversationV2;
use diesel::SqliteConnection;
pub use folders::SqlFolderV2;
pub use messages::SqlMessageV2;

use crate::errors::ChatGPTResult;

pub struct AllDataV2 {
    pub conversations: Vec<conversations::SqlConversationV2>,
    pub folders: Vec<folders::SqlFolderV2>,
    pub messages: Vec<messages::SqlMessageV2>,
    pub conversation_templates: Vec<conversation_templates::SqlConversationTemplateV2>,
    pub conversation_template_prompts:
        Vec<conversation_template_prompts::SqlConversationTemplatePromptV2>,
}

impl AllDataV2 {
    pub fn new(conn: &mut SqliteConnection) -> ChatGPTResult<Self> {
        let all_conversations = conversations::SqlConversationV2::all(conn)?;
        let all_folders = folders::SqlFolderV2::all(conn)?;
        let all_messages = messages::SqlMessageV2::all(conn)?;
        let all_templates = conversation_templates::SqlConversationTemplateV2::all(conn)?;
        let all_prompts =
            conversation_template_prompts::SqlConversationTemplatePromptV2::all(conn)?;
        Ok(AllDataV2 {
            conversations: all_conversations,
            folders: all_folders,
            messages: all_messages,
            conversation_templates: all_templates,
            conversation_template_prompts: all_prompts,
        })
    }
}
