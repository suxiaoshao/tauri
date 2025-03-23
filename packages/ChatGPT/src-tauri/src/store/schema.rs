// @generated automatically by Diesel CLI.

diesel::table! {
    conversation_templates (id) {
        id -> Integer,
        name -> Text,
        icon -> Text,
        description -> Nullable<Text>,
        mode -> Text,
        adapter -> Text,
        template -> Text,
        prompts -> Text,
        created_time -> TimestamptzSqlite,
        updated_time -> TimestamptzSqlite,
    }
}

diesel::table! {
    conversations (id) {
        id -> Integer,
        folder_id -> Nullable<Integer>,
        path -> Text,
        title -> Text,
        icon -> Text,
        created_time -> TimestamptzSqlite,
        updated_time -> TimestamptzSqlite,
        info -> Nullable<Text>,
        template_id -> Integer,
    }
}

diesel::table! {
    folders (id) {
        id -> Integer,
        name -> Text,
        path -> Text,
        parent_id -> Nullable<Integer>,
        created_time -> TimestamptzSqlite,
        updated_time -> TimestamptzSqlite,
    }
}

diesel::table! {
    messages (id) {
        id -> Integer,
        conversation_id -> Integer,
        conversation_path -> Text,
        role -> Text,
        content -> Text,
        status -> Text,
        created_time -> TimestamptzSqlite,
        updated_time -> TimestamptzSqlite,
        start_time -> TimestamptzSqlite,
        end_time -> TimestamptzSqlite,
    }
}

diesel::joinable!(conversations -> conversation_templates (template_id));
diesel::joinable!(conversations -> folders (folder_id));
diesel::joinable!(messages -> conversations (conversation_id));

diesel::allow_tables_to_appear_in_same_query!(
    conversation_templates,
    conversations,
    folders,
    messages,
);
