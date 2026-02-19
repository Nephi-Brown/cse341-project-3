// controllers/music.js
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
  // #swagger.tags = ['Music']
  // #swagger.summary = 'Get all music (optional search by title, artist, status)'
  try {
    const { title, artist, status } = req.query;

    const filter = {};
    if (title) filter.title = { $regex: title, $options: 'i' };
    if (artist) filter.artist = { $regex: artist, $options: 'i' };

    const parsedStatus = parseStatusQuery(status);
    if (parsedStatus === null) return res.status(400).json({ error: 'status must be true or false' });
    if (parsedStatus !== undefined) filter.status = parsedStatus;

    const cursor = mongodb.getDatabase().db().collection('music').find(filter);
    const items = await cursor.toArray();

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch music.', details: err.message });
  }
};

const getSingle = async (req, res) => {
  // #swagger.tags = ['Music']
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid music id.' });

    const item = await mongodb.getDatabase().db().collection('music').findOne({ _id: new ObjectId(id) });
    if (!item) return res.status(404).json({ error: 'Music item not found.' });

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch music item.', details: err.message });
  }
};

const createMusic = async (req, res) => {
  // #swagger.tags = ['Music']
  try {
    const music = {
      title: req.body.title,
      artist: req.body.artist,
      releaseDate: req.body.releaseDate,
      label: req.body.label,
      price: req.body.price,
      bio: req.body.bio,
      status: req.body.status
    };

    const response = await mongodb.getDatabase().db().collection('music').insertOne(music);

    if (response.acknowledged) res.status(201).json({ insertedId: response.insertedId });
    else res.status(500).json({ error: 'Some error occurred while creating the music item.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create music item.', details: err.message });
  }
};

const updateMusic = async (req, res) => {
  // #swagger.tags = ['Music']
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid music id.' });

    const music = {
      title: req.body.title,
      artist: req.body.artist,
      releaseDate: req.body.releaseDate,
      label: req.body.label,
      price: req.body.price,
      bio: req.body.bio,
      status: req.body.status
    };

    const response = await mongodb
      .getDatabase()
      .db()
      .collection('music')
      .replaceOne({ _id: new ObjectId(id) }, music);

    if (response.matchedCount === 0) return res.status(404).json({ error: 'Music item not found.' });

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to update music item.', details: err.message });
  }
};

const deleteMusic = async (req, res) => {
  // #swagger.tags = ['Music']
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid music id.' });

    const response = await mongodb.getDatabase().db().collection('music').deleteOne({ _id: new ObjectId(id) });
    if (response.deletedCount === 0) return res.status(404).json({ error: 'Music item not found.' });

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete music item.', details: err.message });
  }
};

module.exports = {
  getAll,
  getSingle,
  createMusic,
  updateMusic,
  deleteMusic
};
