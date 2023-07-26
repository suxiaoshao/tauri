-- Your SQL goes here
create table conversations
(
    id           INTEGER primary key autoincrement not null,
    title        TEXT                              not null,
    mode         TEXT                              not null check ( mode in ('contextual', 'single') ),
    created_time NUMERIC                           not null,
    updated_time NUMERIC                           not null,
    info         TEXT,
    prompt       TEXT
);

create table messages
(
    id              INTEGER primary key autoincrement not null,
    conversation_id INTEGER                           not null,
    role            TEXT                              not null check ( role in ('system', 'user', 'assistant') ),
    content         TEXT                              not null,
    status          TEXT                              not null check ( status in ('normal', 'hidden') ),
    created_time    NUMERIC                           not null,
    updated_time    NUMERIC                           not null,
    start_time      NUMERIC                           not null,
    end_time        NUMERIC                           not null,
    foreign key (conversation_id) references conversations (id)
);
