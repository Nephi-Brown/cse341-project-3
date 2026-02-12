// routes/literature.js
const express = require('express');
const router = express.Router();

const literatureController = require('../controllers/literature');
const validate = require('../middleware/validate');
const { isAuthenticated } = require('../middleware/authenticate');

const literatureRules = {
  title: 'required|string',
  author: 'required|string',
  publishDate: 'required|string',
  publisher: 'required|string',
  price: 'required|numeric',
  bio: 'required|string',
  status: 'required|boolean'
};

router.get('/', literatureController.getAll);
router.get('/:id', literatureController.getSingle);

router.post('/', isAuthenticated, validate(literatureRules), literatureController.createLiterature);
router.put('/:id', isAuthenticated, validate(literatureRules), literatureController.updateLiterature);
router.delete('/:id', isAuthenticated, literatureController.deleteLiterature);

module.exports = router;
