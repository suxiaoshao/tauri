-- Your SQL goes here
CREATE TABLE novel
(
    id                  integer NOT NULL PRIMARY key,
    name                text    NOT NULL,
    desc                text    NOT NULL,
    is_limit            boolean NOT NULL,
    latest_chapter_name text    NOT NULL,
    latest_chapter_id   integer NOT NULL,
    word_count          integer NOT NULL,
    read_count          integer NOT NULL,
    reply_count         integer NOT NULL,
    author_id           integer,
    author_name         text    not null
)