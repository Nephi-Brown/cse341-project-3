// routes/music.js
const express = require('express');
const router = express.Router();

const musicController = require('../controllers/music');
const validate = require('../middleware/validate');
const { isAuthenticated } = require('../middleware/authenticate');

const musicRules = {
  title: 'required|string',
  artist: 'required|string',
  releaseDate: 'required|string',
  label: 'required|string',
  price: 'required|numeric',
  bio: 'required|string',
  status: 'required|boolean'
};

router.get('/', musicController.getAll);
router.get('/:id', musicController.getSingle);

router.post('/', isAuthenticated, validate(musicRules), musicController.createMusic);
router.put('/:id', isAuthenticated, validate(musicRules), musicController.updateMusic);
router.delete('/:id', isAuthenticated, musicController.deleteMusic);

module.exports = router;
