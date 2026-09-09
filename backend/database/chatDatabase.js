const Database =
  require("better-sqlite3");

const path =
  require("path");

const fs =
  require("fs");

const dataDirectory =
  path.join(
    __dirname,
    "..",
    "data"
  );

if (
  !fs.existsSync(
    dataDirectory
  )
) {

  fs.mkdirSync(
    dataDirectory,
    {
      recursive:
        true,
    }
  );

}

const databasePath =
  path.join(
    dataDirectory,
    "chat.sqlite"
  );

const db =
  new Database(
    databasePath
  );

db.pragma(
  "journal_mode = WAL"
);

db.pragma(
  "foreign_keys = ON"
);

db.exec(`

  CREATE TABLE IF NOT EXISTS messages (

    id INTEGER
      PRIMARY KEY
      AUTOINCREMENT,

    message_id TEXT
      UNIQUE
      NOT NULL,

    sender_id TEXT
      NOT NULL,

    receiver_id TEXT
      NOT NULL,

    message TEXT
      NOT NULL,

    status TEXT
      NOT NULL
      DEFAULT 'sent',

    created_at DATETIME
      DEFAULT CURRENT_TIMESTAMP,

    delivered_at DATETIME,

    read_at DATETIME

  );

`);

db.exec(`

  CREATE INDEX IF NOT EXISTS
  idx_messages_sender_receiver

  ON messages (

    sender_id,
    receiver_id

  );

`);


db.exec(`

  CREATE INDEX IF NOT EXISTS
  idx_messages_receiver_status

  ON messages (

    receiver_id,
    status

  );

`);


module.exports =
  db;