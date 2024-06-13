// app.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { db, getUser } = require('./database');
const app = express();
const port = 5000;

const TOKEN = process.env.TOKEN;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

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

        // Redirect based on role
        switch (user.role) {
          case 'student':
            res.redirect(`/student${user.userID.charAt(user.userID.length - 1)}`);
            break;
          case 'teacher':
            res.redirect('/teacher');
            break;
          case 'admin':
            res.redirect('/admin');
            break;
          default:
            res.render('start');
            break;
        }
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
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      res.status(500).send(err.message);
    } else {
      res.render('admin', { users: rows });
    }
  });
});

app.get('/student1', authenticateJWT, authorizeRole('student'), (req, res) => {
  res.render('student1');
});

app.get('/student2', authenticateJWT, authorizeRole('student'), (req, res) => {
  res.render('student2');
});

app.get('/teacher', authenticateJWT, authorizeRole('teacher'), (req, res) => {
  res.render('teacher');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
