// @generated automatically by Diesel CLI.

diesel::table! {
    conversations (id) {
        id -> Integer,
        folder_id -> Nullable<Integer>,
        path -> Text,
        title -> Text,
        icon -> Text,
        mode -> Text,
        model -> Text,
        temperature -> Double,
        top_p -> Double,
        n -> BigInt,
        max_tokens -> Nullable<BigInt>,
        presence_penalty -> Double,
        frequency_penalty -> Double,
        created_time -> TimestamptzSqlite,
        updated_time -> TimestamptzSqlite,
        info -> Nullable<Text>,
        prompt -> Nullable<Text>,
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

diesel::joinable!(conversations -> folders (folder_id));
diesel::joinable!(messages -> conversations (conversation_id));

diesel::allow_tables_to_appear_in_same_query!(conversations, folders, messages,);
