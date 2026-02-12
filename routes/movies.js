// routes/movies.js
const express = require('express');
const router = express.Router();

const moviesController = require('../controllers/movies');
const validate = require('../middleware/validate');
const { isAuthenticated } = require('../middleware/authenticate');

const movieRules = {
  title: 'required|string',
  director: 'required|string',
  releaseDate: 'required|string',
  studio: 'required|string',
  price: 'required|numeric',
  bio: 'required|string',
  status: 'required|boolean'
};

router.get('/', moviesController.getAll);
router.get('/:id', moviesController.getSingle);

router.post('/', isAuthenticated, validate(movieRules), moviesController.createMovie);
router.put('/:id', isAuthenticated, validate(movieRules), moviesController.updateMovie);
router.delete('/:id', isAuthenticated, moviesController.deleteMovie);

module.exports = router;
