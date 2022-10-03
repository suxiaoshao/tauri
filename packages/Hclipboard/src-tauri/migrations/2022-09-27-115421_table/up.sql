-- Your SQL goes
create table history
(
    id          INTEGER primary key autoincrement not null,
    data        text                              not null,
    update_time NUMERIC                           not null
);

CREATE UNIQUE INDEX history_data
    on history (data);
CREATE INDEX history_time
    ON history (update_time);