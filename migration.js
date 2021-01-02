const sqlite3 = require("sqlite3");

var db = new sqlite3.Database("./database.sqlite");

db.run(
  `CREATE TABLE IF NOT EXISTS Employee (
    id INTEGER NOT NULL,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    wage INTEGER NOT NULL,
    is_current_employee INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (id) 
    )
  `
);

db.run(
  `CREATE TABLE IF NOT EXISTS Timesheet (
    id INTEGER PRIMARY KEY NOT NULL,
    hours INTEGER NOT NULL,
    rate INTEGER NOT NULL,
    date INTEGER NOT NULL,
    employee_id INTEGER REFERENCES Employee (id) NOT NULL
  )
  `
);

db.run(
  `CREATE TABLE IF NOT EXISTS Menu (
    id INTEGER PRIMARY KEY NOT NULL,
    title TEXT NOT NULL
  )
  `
);

db.run(
  `CREATE TABLE IF NOT EXISTS MenuItem (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    inventory INTEGER NOT NULL,
    price INTEGER NOT NULL,
    menu_id INTEGER REFERENCES Menu (id) NOT NULL
  )
  `
);
