-- This file should undo anything in `up.sql`
drop index history_data;
drop index history_time;
drop table if exists `history`;