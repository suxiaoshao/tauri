-- Your SQL goes here
create table novel_tag
(
    novel_id integer not null,
    tag_id   text    not null,
    primary key (novel_id, tag_id)
)