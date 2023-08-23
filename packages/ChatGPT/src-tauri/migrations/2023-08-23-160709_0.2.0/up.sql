-- Your SQL goes here
create table folder
(
    id        integer primary key,
    name      text not null,
    parent_id integer references folder (id)
);