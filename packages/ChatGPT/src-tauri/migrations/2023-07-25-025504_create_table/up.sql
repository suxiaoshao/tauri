-- Your SQL goes here
create table folders
(
    id           INTEGER primary key autoincrement not null,
    name         TEXT                              not null,
    path         TEXT                              not null,
    parent_id    INTEGER,
    created_time DateTime                          not null,
    updated_time DateTime                          not null,
    unique (name, parent_id),
    unique (path),
    foreign key (parent_id) references folders (id)
);

create table conversations
(
    id                INTEGER primary key autoincrement not null,
    folder_id         INTEGER,
    path              TEXT                              not null,
    title             TEXT                              not null,
    icon              TEXT                              not null,
    mode              TEXT                              not null check ( mode in ('contextual', 'single', 'assistant-only') )     default 'contextual',
    model             TEXT                              not null,
    temperature       DOUBLE                            not null check ( temperature >= 0.0 and temperature <= 1.0 )              default 1.0,
    top_p             DOUBLE                            not null check ( top_p >= 0.0 and top_p <= 1.0 )                          default 1.0,
    n                 BIGINT                            not null check ( n >= 1 )                                                 default 1,
    max_tokens        BIGINT check ( max_tokens >= 1 )                                                                            default null,
    presence_penalty  DOUBLE                            not null check ( presence_penalty >= -2.0 and presence_penalty <= 2.0 )   default 0.0,
    frequency_penalty DOUBLE                            not null check ( frequency_penalty >= -2.0 and frequency_penalty <= 2.0 ) default 0.0,
    created_time      DateTime                          not null,
    updated_time      DateTime                          not null,
    info              TEXT,
    prompt            TEXT,
    foreign key (folder_id) references folders (id),
    unique (path)
);



insert
into conversations (title, path, icon, mode, model, created_time, updated_time, info, prompt)
values ('默认', '/默认', '🤖', 'contextual', 'gpt-3.5-turbo-0613', (SELECT datetime('now')),
        (SELECT datetime('now')),
        '默认', null);

create table messages
(
    id                INTEGER primary key autoincrement not null,
    conversation_id   INTEGER                           not null,
    conversation_path TEXT                              not null,
    role              TEXT                              not null check ( role in ('system', 'user', 'assistant') ),
    content           TEXT                              not null,
    status            TEXT                              not null check ( status in ('normal', 'hidden', 'loading', 'error') ),
    created_time      DateTime                          not null,
    updated_time      DateTime                          not null,
    start_time        DateTime                          not null,
    end_time          DateTime                          not null,
    foreign key (conversation_id) references conversations (id)
);

CREATE INDEX idx_messages_conversation_id ON messages (conversation_id);

CREATE INDEX idx_messages_start_time ON messages (start_time);

CREATE INDEX idx_messages_status ON messages (status);

CREATE INDEX idx_messages_content ON messages (content);

