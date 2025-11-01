// @generated automatically by Diesel CLI.

diesel::table! {
    history (id) {
        id -> Integer,
        data -> Binary,
        #[sql_name = "type"]
        type_ -> Text,
        update_time -> BigInt,
    }
}
