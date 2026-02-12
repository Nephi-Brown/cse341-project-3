// routes/videogames.js
const express = require('express');
const router = express.Router();

const videogamesController = require('../controllers/videogames');
const validate = require('../middleware/validate');
const { isAuthenticated } = require('../middleware/authenticate');

const videogameRules = {
  title: 'required|string',
  creator: 'required|string',
  releaseDate: 'required|string',
  publisher: 'required|string',
  price: 'required|numeric',
  description: 'required|string',
  status: 'required|boolean'
};

router.get('/', videogamesController.getAll);
router.get('/:id', videogamesController.getSingle);

router.post('/', isAuthenticated, validate(videogameRules), videogamesController.createVideogame);
router.put('/:id', isAuthenticated, validate(videogameRules), videogamesController.updateVideogame);
router.delete('/:id', isAuthenticated, videogamesController.deleteVideogame);

module.exports = router;
