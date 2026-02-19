// controllers/literature.js
const mongodb = require('../data/database');
const { ObjectId } = require('mongodb');

const isValidObjectId = (id) => ObjectId.isValid(id);

const parseStatusQuery = (status) => {
  if (status === undefined) return undefined;
  if (status === 'true') return true;
  if (status === 'false') return false;
  return null; // invalid
};

const getAll = async (req, res) => {
  // #swagger.tags = ['Literature']
  // #swagger.summary = 'Get all literature (optional search by title, author, status)'
  try {
    const { title, author, status } = req.query;

    const filter = {};
    if (title) filter.title = { $regex: title, $options: 'i' };
    if (author) filter.author = { $regex: author, $options: 'i' };

    const parsedStatus = parseStatusQuery(status);
    if (parsedStatus === null) {
      return res.status(400).json({ error: 'status must be true or false' });
    }
    if (parsedStatus !== undefined) filter.status = parsedStatus;

    const cursor = mongodb.getDatabase().db().collection('literature').find(filter);
    const items = await cursor.toArray();

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch literature.', details: err.message });
  }
};

const getSingle = async (req, res) => {
  // #swagger.tags = ['Literature']
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid literature id.' });

    const item = await mongodb
      .getDatabase()
      .db()
      .collection('literature')
      .findOne({ _id: new ObjectId(id) });

    if (!item) return res.status(404).json({ error: 'Literature item not found.' });

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch literature item.', details: err.message });
  }
};

const createLiterature = async (req, res) => {
  // #swagger.tags = ['Literature']
  try {
    const literatureItem = {
      title: req.body.title,
      author: req.body.author,
      publishDate: req.body.publishDate,
      publisher: req.body.publisher,
      price: req.body.price,
      bio: req.body.bio,
      status: req.body.status
    };

    const response = await mongodb.getDatabase().db().collection('literature').insertOne(literatureItem);

    if (response.acknowledged) res.status(201).json({ insertedId: response.insertedId });
    else res.status(500).json({ error: 'Some error occurred while creating the literature item.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create literature item.', details: err.message });
  }
};

const updateLiterature = async (req, res) => {
  // #swagger.tags = ['Literature']
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid literature id.' });

    const literatureItem = {
      title: req.body.title,
      author: req.body.author,
      publishDate: req.body.publishDate,
      publisher: req.body.publisher,
      price: req.body.price,
      bio: req.body.bio,
      status: req.body.status
    };

    const response = await mongodb
      .getDatabase()
      .db()
      .collection('literature')
      .replaceOne({ _id: new ObjectId(id) }, literatureItem);

    if (response.matchedCount === 0) return res.status(404).json({ error: 'Literature item not found.' });

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to update literature item.', details: err.message });
  }
};

const deleteLiterature = async (req, res) => {
  // #swagger.tags = ['Literature']
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid literature id.' });

    const response = await mongodb
      .getDatabase()
      .db()
      .collection('literature')
      .deleteOne({ _id: new ObjectId(id) });

    if (response.deletedCount === 0) return res.status(404).json({ error: 'Literature item not found.' });

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete literature item.', details: err.message });
  }
};

module.exports = {
  getAll,
  getSingle,
  createLiterature,
  updateLiterature,
  deleteLiterature
};
