// database.js
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./users.db');

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (userID TEXT PRIMARY KEY, username TEXT, role TEXT, password TEXT)");

  // Insert initial users
  const insert = 'INSERT OR IGNORE INTO users (userID, username, role, password) VALUES (?, ?, ?, ?)';
  db.run(insert, ['id1', 'user1', 'student', bcrypt.hashSync('password', 10)]);
  db.run(insert, ['id2', 'user2', 'student', bcrypt.hashSync('password2', 10)]);
  db.run(insert, ['id3', 'user3', 'teacher', bcrypt.hashSync('password3', 10)]);
  db.run(insert, ['admin', 'admin', 'admin', bcrypt.hashSync('admin', 10)]);
});

const addUser = (username, password) => {
  return new Promise((resolve, reject) => {
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) {
        reject(err);
      } else {
        const stmt = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");
        stmt.run(username, hash, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
        stmt.finalize();
      }
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
