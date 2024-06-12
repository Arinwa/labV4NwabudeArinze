// app.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getUser } = require('./database');
const app = express();
const port = 5000;

const TOKEN = process.env.TOKEN;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));

const authenticateJWT = (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    jwt.verify(token, TOKEN, (err, user) => {
      if (err) {
        return res.redirect('/LOGIN');
      }
      req.user = user;
      next();
    });
  } else {
    res.redirect('/LOGIN');
  }
};

const authorizeRole = (role) => {
  return (req, res, next) => {
    if (req.user.role === role) {
      next();
    } else {
      res.status(401).send('Unauthorized');
    }
  };
};

app.get('/', (req, res) => {
  res.redirect('/LOGIN');
});

app.get('/LOGIN', (req, res) => {
  res.render('login');
});

app.post('/LOGIN', async (req, res) => {
  const { name, password } = req.body;
  try {
    const user = await getUser(name);
    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const token = jwt.sign({ userID: user.userID, username: user.username, role: user.role }, TOKEN, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });
        res.render('start');
      } else {
        res.render('fail');
      }
    } else {
      res.render('fail');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/REGISTER', (req, res) => {
  res.render('register');
});

app.post('/REGISTER', async (req, res) => {
  const { name, password } = req.body;
  try {
    await addUser(name, password);
    res.redirect('/LOGIN');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/admin', authenticateJWT, authorizeRole('admin'), (req, res) => {
  // Fetch users from the database
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.render('admin', { users: rows });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
