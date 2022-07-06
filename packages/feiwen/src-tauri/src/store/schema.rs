table! {
    novel (id) {
        id -> Integer,
        name -> Text,
        desc -> Text,
        is_limit -> Bool,
        latest_chapter_name -> Text,
        latest_chapter_id -> Integer,
        word_count -> Integer,
        read_count -> Integer,
        reply_count -> Integer,
        author_id -> Nullable<Integer>,
        author_name -> Text,
    }
}

table! {
    novel_tag (novel_id, tag_id) {
        novel_id -> Integer,
        tag_id -> Text,
    }
}

table! {
    tag (name) {
        href -> Text,
        name -> Text,
    }
}

allow_tables_to_appear_in_same_query!(
    novel,
    novel_tag,
    tag,
);
