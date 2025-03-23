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

CREATE TABLE conversation_templates
(
    id           Integer PRIMARY KEY AUTOINCREMENT not null,
    name         TEXT                              NOT NULL,
    icon         TEXT                              not null,
    description  TEXT,
    mode         TEXT                              not null check ( mode in ('contextual', 'single', 'assistant-only') ) default 'contextual',
    adapter      TEXT                              NOT NULL,
    template     TEXT                              NOT NULL,
    prompts      TEXT                              NOT NULL,
    created_time DateTime                          not null,
    updated_time DateTime                          not null
);

create table conversations
(
    id           INTEGER primary key autoincrement not null,
    folder_id    INTEGER,
    path         TEXT                              not null,
    title        TEXT                              not null,
    icon         TEXT                              not null,
    created_time DateTime                          not null,
    updated_time DateTime                          not null,
    info         TEXT,
    template_id  INTEGER                           not null,
    foreign key (folder_id) references folders (id),
    FOREIGN KEY (template_id) REFERENCES conversation_templates (id),
    unique (path)
);


create table messages
(
    id                INTEGER primary key autoincrement not null,
    conversation_id   INTEGER                           not null,
    conversation_path TEXT                              not null,
    role              TEXT                              not null check ( role in ('developer', 'user', 'assistant') ),
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
