const express = require('express');

const authRoutes = express.Router();
const passport = require('passport');


// User model
const bcrypt = require('bcrypt');
const User = require('../models/user');

// Bcrypt to encrypt passwords
const bcryptSalt = 10;

authRoutes.get('/signup', (req, res, next) => {
  res.render('auth/signup');
});

authRoutes.post('/signup', (req, res, next) => {
  const { username } = req.body;
  const { password } = req.body;

  if (username === '' || password === '') {
    res.render('auth/signup', { message: 'Indicate username and password' });
    return;
  }

  User.findOne({ username })
    .then((user) => {
      if (user !== null) {
        res.render('auth/signup', { message: 'The username already exists' });
        return;
      }

      const salt = bcrypt.genSaltSync(bcryptSalt);
      const hashPass = bcrypt.hashSync(password, salt);

      const newUser = new User({
        username,
        password: hashPass,
      });

      newUser.save((err) => {
        if (err) {
          res.render('auth/signup', { message: 'Something went wrong' });
        } else {
          res.redirect('/');
        }
      });
    })
    .catch((error) => {
      next(error);
    });
});

authRoutes.get('/login', (req, res) => {
  res.render('auth/login', { message: req.flash('error') });
});

authRoutes.post('/login', passport.authenticate('local', {
  successRedirect: '/books',
  failureRedirect: '/auth/login',
  failureFlash: true,
  passReqToCallback: true,
}));

authRoutes.get('/slack', passport.authenticate('slack'));

authRoutes.get('/slack/callback', passport.authenticate('slack', {
  successRedirect: '/books',
  failureRedirect: '/auth/login',
}));

authRoutes.get('/google', passport.authenticate('google', {
  scope: ['https://www.googleapis.com/auth/plus.login',
    'https://www.googleapis.com/auth/plus.profile.emails.read'],
}));

authRoutes.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/auth/login',
  successRedirect: '/books',
}));

authRoutes.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/auth/login');
});

module.exports = authRoutes;
