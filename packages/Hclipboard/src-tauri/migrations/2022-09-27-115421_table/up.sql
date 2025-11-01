-- Your SQL goes
create table history
(
    id          INTEGER primary key autoincrement not null,
    data        blob                              not null,
    type        text                              not null check ( type in ('text', 'rtf', 'html', 'image', 'files') ),
    update_time NUMERIC                           not null
);

CREATE UNIQUE INDEX history_data
    on history (data);
CREATE INDEX history_time
    ON history (update_time);