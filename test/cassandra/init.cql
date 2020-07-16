CREATE KEYSPACE IF NOT EXISTS tiny_slug WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};
USE tiny_slug;

CREATE TABLE IF NOT EXISTS slug_gen
(
    name TEXT PRIMARY KEY,
    cnt  COUNTER
);

UPDATE slug_gen
SET cnt = cnt + 9
WHERE name = 'auto';

CREATE TABLE IF NOT EXISTS slug_links
(
    slug TEXT PRIMARY KEY,
    url  TEXT
);

CREATE INDEX ON slug_links (url);
