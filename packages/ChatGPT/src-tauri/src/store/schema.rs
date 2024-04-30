/*
 * @Author: suxiaoshao suxiaoshao@gmail.com
 * @Date: 2024-04-19 15:40:29
 * @LastEditors: suxiaoshao suxiaoshao@gmail.com
 * @LastEditTime: 2024-05-01 01:10:12
 * @FilePath: /tauri/packages/ChatGPT/src-tauri/src/store/schema.rs
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// @generated automatically by Diesel CLI.

diesel::table! {
    conversation_template_prompts (id) {
        id -> Integer,
        template_id -> Integer,
        prompt -> Text,
        role -> Text,
        created_time -> TimestamptzSqlite,
        updated_time -> TimestamptzSqlite,
    }
}

diesel::table! {
    conversation_templates (id) {
        id -> Integer,
        name -> Text,
        icon -> Text,
        description -> Nullable<Text>,
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

diesel::joinable!(conversation_template_prompts -> conversation_templates (template_id));
diesel::joinable!(conversations -> conversation_templates (template_id));
diesel::joinable!(conversations -> folders (folder_id));
diesel::joinable!(messages -> conversations (conversation_id));

diesel::allow_tables_to_appear_in_same_query!(
    conversation_template_prompts,
    conversation_templates,
    conversations,
    folders,
    messages,
);
