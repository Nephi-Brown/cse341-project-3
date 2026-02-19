// controllers/borrow.js
const mongodb = require('../data/database');
const { ObjectId } = require('mongodb');

const allowedCollections = ['literature', 'videogames', 'movies', 'music'];
const getGithubIdFromSession = (req) => String(req.session?.user?.id || '');

const checkout = async (req, res) => {
  // #swagger.tags = ['Borrow']
  try {
    const githubId = getGithubIdFromSession(req);
    const col = String(req.params.collection || '').toLowerCase();
    const id = String(req.params.id || '');

    if (!allowedCollections.includes(col)) {
      return res.status(400).json({ error: `collection must be one of: ${allowedCollections.join(', ')}` });
    }
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id.' });

    const db = mongodb.getDatabase().db();
    const item = await db.collection(col).findOne({ _id: new ObjectId(id) });
    if (!item) return res.status(404).json({ error: 'Item not found.' });

    if (item.status === false) return res.status(409).json({ error: 'Item already checked out.' });

    await db.collection(col).updateOne({ _id: item._id }, { $set: { status: false } });

    const entry = {
      at: new Date(),
      action: 'checkout',
      collection: col,
      itemId: item._id,
      title: item.title || null
    };

    await db.collection('users').updateOne({ githubId }, { $push: { borrowingHistory: entry } });

    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: 'Failed to checkout item.', details: err.message });
  }
};

const returnItem = async (req, res) => {
  // #swagger.tags = ['Borrow']
  try {
    const githubId = getGithubIdFromSession(req);
    const col = String(req.params.collection || '').toLowerCase();
    const id = String(req.params.id || '');

    if (!allowedCollections.includes(col)) {
      return res.status(400).json({ error: `collection must be one of: ${allowedCollections.join(', ')}` });
    }
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id.' });

    const db = mongodb.getDatabase().db();
    const item = await db.collection(col).findOne({ _id: new ObjectId(id) });
    if (!item) return res.status(404).json({ error: 'Item not found.' });

    if (item.status === true) return res.status(409).json({ error: 'Item is already available.' });

    await db.collection(col).updateOne({ _id: item._id }, { $set: { status: true } });

    const entry = {
      at: new Date(),
      action: 'return',
      collection: col,
      itemId: item._id,
      title: item.title || null
    };

    await db.collection('users').updateOne({ githubId }, { $push: { borrowingHistory: entry } });

    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: 'Failed to return item.', details: err.message });
  }
};

module.exports = { checkout, returnItem };
