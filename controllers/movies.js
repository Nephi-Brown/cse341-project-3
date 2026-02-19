// controllers/movies.js
const mongodb = require('../data/database');
const { ObjectId } = require('mongodb');

const isValidObjectId = (id) => ObjectId.isValid(id);

const parseStatusQuery = (status) => {
  if (status === undefined) return undefined;
  if (status === 'true') return true;
  if (status === 'false') return false;
  return null;
};

const getAll = async (req, res) => {
  // #swagger.tags = ['Movies']
  // #swagger.summary = 'Get all movies (optional search by title, director, status)'
  try {
    const { title, director, status } = req.query;

    const filter = {};
    if (title) filter.title = { $regex: title, $options: 'i' };
    if (director) filter.director = { $regex: director, $options: 'i' };

    const parsedStatus = parseStatusQuery(status);
    if (parsedStatus === null) return res.status(400).json({ error: 'status must be true or false' });
    if (parsedStatus !== undefined) filter.status = parsedStatus;

    const cursor = mongodb.getDatabase().db().collection('movies').find(filter);
    const items = await cursor.toArray();

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch movies.', details: err.message });
  }
};

const getSingle = async (req, res) => {
  // #swagger.tags = ['Movies']
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid movie id.' });

    const item = await mongodb.getDatabase().db().collection('movies').findOne({ _id: new ObjectId(id) });
    if (!item) return res.status(404).json({ error: 'Movie not found.' });

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch movie.', details: err.message });
  }
};

const createMovie = async (req, res) => {
  // #swagger.tags = ['Movies']
  try {
    const movie = {
      title: req.body.title,
      director: req.body.director,
      releaseDate: req.body.releaseDate,
      studio: req.body.studio,
      price: req.body.price,
      bio: req.body.bio,
      status: req.body.status
    };

    const response = await mongodb.getDatabase().db().collection('movies').insertOne(movie);

    if (response.acknowledged) res.status(201).json({ insertedId: response.insertedId });
    else res.status(500).json({ error: 'Some error occurred while creating the movie.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create movie.', details: err.message });
  }
};

const updateMovie = async (req, res) => {
  // #swagger.tags = ['Movies']
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid movie id.' });

    const movie = {
      title: req.body.title,
      director: req.body.director,
      releaseDate: req.body.releaseDate,
      studio: req.body.studio,
      price: req.body.price,
      bio: req.body.bio,
      status: req.body.status
    };

    const response = await mongodb
      .getDatabase()
      .db()
      .collection('movies')
      .replaceOne({ _id: new ObjectId(id) }, movie);

    if (response.matchedCount === 0) return res.status(404).json({ error: 'Movie not found.' });

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to update movie.', details: err.message });
  }
};

const deleteMovie = async (req, res) => {
  // #swagger.tags = ['Movies']
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid movie id.' });

    const response = await mongodb.getDatabase().db().collection('movies').deleteOne({ _id: new ObjectId(id) });
    if (response.deletedCount === 0) return res.status(404).json({ error: 'Movie not found.' });

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete movie.', details: err.message });
  }
};

module.exports = {
  getAll,
  getSingle,
  createMovie,
  updateMovie,
  deleteMovie
};
