// app.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { db, addUser, getUser } = require('./database');
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

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.redirect(`/identify?redirect=${req.originalUrl}`);
    }
  };
};

const reidentify = async (req, res, next) => {
  const { name, password, redirect } = req.body;
  try {
    const user = await getUser(name);
    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        req.user = user;
        const token = jwt.sign({ userID: user.userID, username: user.username, role: user.role }, TOKEN, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });
        res.redirect(redirect || '/');
      } else {
        res.status(401).send('Unauthorized');
      }
    } else {
      res.status(401).send('Unauthorized');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
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
            res.redirect(`/users/${user.userID}`);
            break;
          case 'teacher':
            res.redirect(`/users/${user.userID}`);
            break;
          case 'admin':
            res.redirect(`/users/${user.userID}`);
            break;
          default:
            res.redirect(`/users/${user.userID}`);
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
  const { userID, name, password, role } = req.body;
  if (role !== 'student' && role !== 'teacher') {
    return res.status(400).send('Invalid role');
  }
  try {
    await new Promise((resolve, reject) => {
      addUser(userID, name, role, password);
      resolve();
    });
    res.redirect('/identify');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/admin', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  console.log('Admin route accessed');
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      res.status(500).send(err.message);
    } else {
      console.log('Users fetched:', rows);
      res.render('admin', { users: rows });
    }
  });
});

app.get('/student1', authenticateJWT, authorizeRoles('student', 'teacher', 'admin'), (req, res) => {
  res.render('student1');
});

app.get('/student2', authenticateJWT, authorizeRoles('student', 'teacher', 'admin'), (req, res) => {
  res.render('student2');
});

app.get('/teacher', authenticateJWT, authorizeRoles('teacher', 'admin'), (req, res) => {
  res.render('teacher');
});

app.get('/identify', (req, res) => {
  res.render('identify', { redirect: req.query.redirect });
});

app.post('/identify', reidentify);

// Dynamic route for user profiles
app.get('/users/:userId', authenticateJWT, (req, res) => {
  const userId = req.params.userId;
  if (req.user.userID === userId) {
    if (req.user.role === 'admin') {
      db.all("SELECT * FROM users", [], (err, rows) => {
        if (err) {
          console.error('Database error:', err.message);
          res.status(500).send(err.message);
        } else {
          res.render('admin', { users: rows });
        }
      });
    } else {
      res.render('userProfile', { user: req.user });
    }
  } else {
    res.status(403).send('Forbidden');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
