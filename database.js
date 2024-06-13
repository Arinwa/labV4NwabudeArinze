// database.js
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./users.db');

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (userID TEXT PRIMARY KEY, username TEXT, role TEXT, password TEXT)");

  // Add initial users if not already present
  db.get("SELECT * FROM users WHERE userID = 'id1'", (err, row) => {
    if (!row) {
      addUser('id1', 'user1', 'student', 'password');
      addUser('id2', 'user2', 'student', 'password2');
      addUser('id3', 'user3', 'teacher', 'password3');
      addUser('admin', 'admin', 'admin', 'admin');
    }
  });
});

const addUser = (userID, username, role, password) => {
  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) throw err;
    const stmt = db.prepare("INSERT INTO users (userID, username, role, password) VALUES (?, ?, ?, ?)");
    stmt.run(userID, username, role, hash, (err) => {
      if (err) throw err;
      stmt.finalize();
    });
  });
};

const getUser = (username) => {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

module.exports = { db, addUser, getUser };
