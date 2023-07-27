-- Your SQL goes here
create table conversations
(
    id           INTEGER primary key autoincrement not null,
    title        TEXT                              not null,
    mode         TEXT                              not null check ( mode in ('contextual', 'single') ),
    created_time BIGINT                            not null,
    updated_time BIGINT                            not null,
    info         TEXT,
    prompt       TEXT
);

WITH current_utc_timestamp AS (SELECT (strftime('%s', 'now') * 1000 + strftime('%f', 'now') / 1000) AS value)

insert
into conversations (title, mode, created_time, updated_time, info, prompt)
values ('默认', 'contextual', (SELECT value FROM current_utc_timestamp), (SELECT value FROM current_utc_timestamp),
        '默认', null);

create table messages
(
    id              INTEGER primary key autoincrement not null,
    conversation_id INTEGER                           not null,
    role            TEXT                              not null check ( role in ('system', 'user', 'assistant') ),
    content         TEXT                              not null,
    status          TEXT                              not null check ( status in ('normal', 'hidden') ),
    created_time    BIGINT                            not null,
    updated_time    BIGINT                            not null,
    start_time      BIGINT                            not null,
    end_time        BIGINT                            not null,
    foreign key (conversation_id) references conversations (id)
);

CREATE INDEX idx_messages_conversation_id ON messages (conversation_id);

CREATE INDEX idx_messages_start_time ON messages (start_time);

CREATE INDEX idx_messages_status ON messages (status);

CREATE INDEX idx_messages_content ON messages (content);

