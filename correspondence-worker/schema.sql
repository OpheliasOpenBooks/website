-- Run once with: npx wrangler d1 execute ophelia-correspondence --remote --file=./correspondence-worker/schema.sql
CREATE TABLE IF NOT EXISTS letters (
 id TEXT PRIMARY KEY NOT NULL,
 kind TEXT NOT NULL CHECK(kind IN ('public','editor')),
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','closed')),
 name TEXT NOT NULL DEFAULT 'Anonymous',
 topic TEXT NOT NULL DEFAULT '',
 book TEXT NOT NULL DEFAULT '',
 page TEXT NOT NULL DEFAULT '',
 source TEXT NOT NULL DEFAULT '',
 body TEXT NOT NULL,
 parent_id TEXT DEFAULT NULL,
 flags INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 reviewed_at TEXT DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS letters_public ON letters(kind,status,created_at);
CREATE INDEX IF NOT EXISTS letters_pending ON letters(status,created_at);
CREATE INDEX IF NOT EXISTS letters_parent ON letters(parent_id);
-- Hashed, rotating daily rate keys; never store raw IP addresses.
CREATE TABLE IF NOT EXISTS daily_limits (
 day TEXT NOT NULL,
 ip_hash TEXT NOT NULL,
 total INTEGER NOT NULL DEFAULT 0,
 PRIMARY KEY (day, ip_hash)
);
