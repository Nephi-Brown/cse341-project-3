// controllers/videogames.js
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
  // #swagger.tags = ['VideoGames']
  // #swagger.summary = 'Get all video games (optional search by title, developer, status)'
  try {
    const { title, developer, status } = req.query;

    const filter = {};
    if (title) filter.title = { $regex: title, $options: 'i' };
    if (developer) filter.developer = { $regex: developer, $options: 'i' };

    const parsedStatus = parseStatusQuery(status);
    if (parsedStatus === null) return res.status(400).json({ error: 'status must be true or false' });
    if (parsedStatus !== undefined) filter.status = parsedStatus;

    const cursor = mongodb.getDatabase().db().collection('videogames').find(filter);
    const items = await cursor.toArray();

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch video games.', details: err.message });
  }
};

const getSingle = async (req, res) => {
  // #swagger.tags = ['VideoGames']
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid video game id.' });

    const item = await mongodb
      .getDatabase()
      .db()
      .collection('videogames')
      .findOne({ _id: new ObjectId(id) });

    if (!item) return res.status(404).json({ error: 'Video game not found.' });

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch video game.', details: err.message });
  }
};

const createVideogame = async (req, res) => {
  // #swagger.tags = ['VideoGames']
  try {
    const game = {
      title: req.body.title,
      developer: req.body.developer,
      releaseDate: req.body.releaseDate,
      publisher: req.body.publisher,
      price: req.body.price,
      bio: req.body.bio,
      status: req.body.status
    };

    const response = await mongodb.getDatabase().db().collection('videogames').insertOne(game);

    if (response.acknowledged) res.status(201).json({ insertedId: response.insertedId });
    else res.status(500).json({ error: 'Some error occurred while creating the video game.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create video game.', details: err.message });
  }
};

const updateVideogame = async (req, res) => {
  // #swagger.tags = ['VideoGames']
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid video game id.' });

    const game = {
      title: req.body.title,
      developer: req.body.developer,
      releaseDate: req.body.releaseDate,
      publisher: req.body.publisher,
      price: req.body.price,
      bio: req.body.bio,
      status: req.body.status
    };

    const response = await mongodb
      .getDatabase()
      .db()
      .collection('videogames')
      .replaceOne({ _id: new ObjectId(id) }, game);

    if (response.matchedCount === 0) return res.status(404).json({ error: 'Video game not found.' });

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to update video game.', details: err.message });
  }
};

const deleteVideogame = async (req, res) => {
  // #swagger.tags = ['VideoGames']
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid video game id.' });

    const response = await mongodb
      .getDatabase()
      .db()
      .collection('videogames')
      .deleteOne({ _id: new ObjectId(id) });

    if (response.deletedCount === 0) return res.status(404).json({ error: 'Video game not found.' });

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete video game.', details: err.message });
  }
};

module.exports = {
  getAll,
  getSingle,
  createVideogame,
  updateVideogame,
  deleteVideogame
};
