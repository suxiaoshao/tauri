// @generated automatically by Diesel CLI.

diesel::table! {
    history (id) {
        id -> Integer,
        data -> Text,
        update_time -> Timestamp,
    }
}
