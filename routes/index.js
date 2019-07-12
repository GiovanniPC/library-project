const express = require('express');

const router = express.Router();
const ensureLogin = require('connect-ensure-login');
const Book = require('../models/book');
const Author = require('../models/author');

router.get('/', (req, res) => {
  res.redirect('/books');
});

router.get('/books', (req, res) => {
  // for test
  // let books = [
  //     {title: 'livro'},
  //     {title: 'livro2'}
  // ]

  Book.find()
    .then((books) => {
      res.render('books', { books, user: req.user });
    })
    .catch(err => console.log(err));
});

router.get('/book-details/:bookID', (req, res) => {
  const book = req.params.bookID;

  Book.findById(book)
    .populate('author')
    .then((book) => {
      res.render('book-details', { book });
    })
    .catch(err => console.log(err));
});

router.get('/books/add', ensureLogin.ensureLoggedIn('/auth/login'), (req, res) => {
  Author.find({}, null, { sort: { name: 1 } })
    .then((autor) => {
      res.render('book-add', { autor, user: req.user });
    })
    .catch(err => console.log(err));
});

router.post('/books/add', (req, res) => {
  const {
    title, author, description, rating, owner,
  } = req.body;
  const newBook = new Book({
    title, author, description, rating, owner,
  });
  newBook.save()
    .then((book) => {
      res.redirect('/');
    })
    .catch((error) => {
      console.log(error);
    });
});

router.get('/books/edit/:bookID', ensureLogin.ensureLoggedIn('/auth/login'), (req, res) => {
  Book.findById(req.params.bookID)
    .then((book) => {
      res.render('book-edit', { book, user: req.user });
    })
    .catch(err => console.log(err));
});

router.post('/books/edit/:bookID', (req, res) => {
  const {
    title, author, description, rating,
  } = req.body;

  Book.update({ _id: req.params.bookID }, {
    $set: {
      title, author, description, rating,
    },
  })
    .then((book) => {
      res.redirect('/');
    })
    .catch((error) => {
      console.log(error);
    });
});

router.get('/authors/add', (req, res) => {
  res.render('author-add');
});

router.post('/authors/add', ensureLogin.ensureLoggedIn('/auth/login'), (req, res) => {
  const {
    name, lastName, nationality, birthday, pictureUrl,
  } = req.body;
  const newAuthor = new Author({
    name, lastName, nationality, birthday, pictureUrl,
  });
  newAuthor.save()
    .then((book) => {
      res.redirect('/');
    })
    .catch((error) => {
      console.log(error);
    });
});

router.post('/reviews/add/:bookID', (req, res) => {
  const { user, comments } = req.body;
  Book.update({ _id: req.params.bookID }, { $push: { reviews: { user, comments } } })
    .then((book) => {
      res.redirect(`/book-details/${req.params.bookID}`);
    })
    .catch((error) => {
      console.log(error);
    });
});

module.exports = router;
