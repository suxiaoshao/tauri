// @generated automatically by Diesel CLI.

diesel::table! {
    conversations (id) {
        id -> Integer,
        title -> Text,
        mode -> Text,
        created_time -> Double,
        updated_time -> Double,
        info -> Nullable<Text>,
        prompt -> Nullable<Text>,
    }
}

diesel::table! {
    messages (id) {
        id -> Integer,
        conversation_id -> Integer,
        role -> Text,
        content -> Text,
        status -> Text,
        created_time -> Double,
        updated_time -> Double,
        start_time -> Double,
        end_time -> Double,
    }
}

diesel::joinable!(messages -> conversations (conversation_id));

diesel::allow_tables_to_appear_in_same_query!(
    conversations,
    messages,
);
