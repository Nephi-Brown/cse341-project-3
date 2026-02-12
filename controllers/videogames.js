// controllers/videogames.js
const mongodb = require('../data/database');
const { ObjectId } = require('mongodb');

const isValidObjectId = (id) => ObjectId.isValid(id);

const getAll = async (req, res) => {
  // #swagger.tags = ['VideoGames']
  try {
    const cursor = mongodb.getDatabase().db().collection('videogames').find();
    const games = await cursor.toArray();
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(games);
  } catch (err) {
    res.status(500).json({
      error: 'Failed to fetch video games.',
      details: err.message
    });
  }
};

const getSingle = async (req, res) => {
  // #swagger.tags = ['VideoGames']
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid video game id.' });
    }

    const gameId = new ObjectId(id);
    const game = await mongodb
      .getDatabase()
      .db()
      .collection('videogames')
      .findOne({ _id: gameId });

    if (!game) {
      return res.status(404).json({ error: 'Video game not found.' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(game);
  } catch (err) {
    res.status(500).json({
      error: 'Failed to fetch video game.',
      details: err.message
    });
  }
};

const createVideogame = async (req, res) => {
  // #swagger.tags = ['VideoGames']
  try {
    // Body validated by middleware
    const game = {
      title: req.body.title,
      creator: req.body.creator,
      releaseDate: req.body.releaseDate,
      publisher: req.body.publisher,
      price: req.body.price,
      description: req.body.description,
      status: req.body.status // true = available, false = checked out
    };

    const response = await mongodb
      .getDatabase()
      .db()
      .collection('videogames')
      .insertOne(game);

    if (response.acknowledged) {
      res.status(201).json({ insertedId: response.insertedId });
    } else {
      res.status(500).json({
        error: 'Some error occurred while creating the video game.'
      });
    }
  } catch (err) {
    res.status(500).json({
      error: 'Failed to create video game.',
      details: err.message
    });
  }
};

const updateVideogame = async (req, res) => {
  // #swagger.tags = ['VideoGames']
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid video game id.' });
    }

    // Body validated by middleware
    const gameId = new ObjectId(id);

    const game = {
      title: req.body.title,
      creator: req.body.creator,
      releaseDate: req.body.releaseDate,
      publisher: req.body.publisher,
      price: req.body.price,
      description: req.body.description,
      status: req.body.status
    };

    const response = await mongodb
      .getDatabase()
      .db()
      .collection('videogames')
      .replaceOne({ _id: gameId }, game);

    if (response.matchedCount === 0) {
      return res.status(404).json({ error: 'Video game not found.' });
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({
      error: 'Failed to update video game.',
      details: err.message
    });
  }
};

const deleteVideogame = async (req, res) => {
  // #swagger.tags = ['VideoGames']
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid video game id.' });
    }

    const gameId = new ObjectId(id);

    const response = await mongodb
      .getDatabase()
      .db()
      .collection('videogames')
      .deleteOne({ _id: gameId });

    if (response.deletedCount === 0) {
      return res.status(404).json({ error: 'Video game not found.' });
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({
      error: 'Failed to delete video game.',
      details: err.message
    });
  }
};

module.exports = {
  getAll,
  getSingle,
  createVideogame,
  updateVideogame,
  deleteVideogame
};
