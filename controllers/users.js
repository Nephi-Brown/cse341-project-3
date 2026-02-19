// controllers/users.js
const mongodb = require('../data/database');
const { ObjectId } = require('mongodb');
const { getPagination } = require('../utils/pagination');

const getGithubIdFromSession = (req) => String(req.session?.user?.id || '');

const getMe = async (req, res) => {
  // #swagger.tags = ['Users']
  try {
    const githubId = getGithubIdFromSession(req);

    const user = await mongodb.getDatabase().db().collection('users').findOne(
      { githubId },
      { projection: { loginHistory: 0 } } // keep response smaller
    );

    if (!user) return res.status(404).json({ error: 'User record not found.' });
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch user.', details: err.message });
  }
};

const getLoginHistory = async (req, res) => {
  // #swagger.tags = ['Users']
  try {
    const githubId = getGithubIdFromSession(req);

    const user = await mongodb.getDatabase().db().collection('users').findOne(
      { githubId },
      { projection: { loginHistory: 1, _id: 0 } }
    );

    if (!user) return res.status(404).json({ error: 'User record not found.' });

    const { page, limit, skip } = getPagination(req.query, { defaultLimit: 10, maxLimit: 50 });

    const logins = Array.isArray(user.loginHistory) ? user.loginHistory : [];
    const total = logins.length;

    // newest first
    const items = logins.slice().reverse().slice(skip, skip + limit);

    return res.status(200).json({ page, limit, total, items });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch login history.', details: err.message });
  }
};

const listFavorites = async (req, res) => {
  // #swagger.tags = ['Users']
  try {
    const githubId = getGithubIdFromSession(req);
    const collection = String(req.query.collection || '').toLowerCase();

    const allowed = ['literature', 'videogames', 'movies', 'music'];
    if (!allowed.includes(collection)) {
      return res.status(400).json({ error: `collection must be one of: ${allowed.join(', ')}` });
    }

    const user = await mongodb.getDatabase().db().collection('users').findOne(
      { githubId },
      { projection: { favorites: 1, _id: 0 } }
    );

    if (!user) return res.status(404).json({ error: 'User record not found.' });

    const ids = user.favorites?.[collection] || [];
    const { page, limit, skip } = getPagination(req.query, { defaultLimit: 10, maxLimit: 50 });

    const total = ids.length;
    const pageIds = ids.slice(skip, skip + limit).map((x) => new ObjectId(String(x)));

    const docs = await mongodb
      .getDatabase()
      .db()
      .collection(collection)
      .find({ _id: { $in: pageIds } })
      .toArray();

    // preserve id order
    const docMap = new Map(docs.map((d) => [String(d._id), d]));
    const items = pageIds.map((id) => docMap.get(String(id))).filter(Boolean);

    return res.status(200).json({ page, limit, total, collection, items });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch favorites.', details: err.message });
  }
};

const addFavorite = async (req, res) => {
  // #swagger.tags = ['Users']
  try {
    const githubId = getGithubIdFromSession(req);

    const col = String(req.body.collection || '').toLowerCase();
    const itemId = String(req.body.itemId || '');

    const allowed = ['literature', 'videogames', 'movies', 'music'];
    if (!allowed.includes(col)) {
      return res.status(400).json({ error: `collection must be one of: ${allowed.join(', ')}` });
    }
    if (!ObjectId.isValid(itemId)) {
      return res.status(400).json({ error: 'Invalid itemId.' });
    }

    // ensure item exists
    const exists = await mongodb.getDatabase().db().collection(col).findOne({ _id: new ObjectId(itemId) });
    if (!exists) return res.status(404).json({ error: 'Item not found.' });

    const field = `favorites.${col}`;
    await mongodb.getDatabase().db().collection('users').updateOne(
      { githubId },
      { $addToSet: { [field]: new ObjectId(itemId) } }
    );

    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: 'Failed to add favorite.', details: err.message });
  }
};

const removeFavorite = async (req, res) => {
  // #swagger.tags = ['Users']
  try {
    const githubId = getGithubIdFromSession(req);

    const col = String(req.params.collection || '').toLowerCase();
    const itemId = String(req.params.itemId || '');

    const allowed = ['literature', 'videogames', 'movies', 'music'];
    if (!allowed.includes(col)) {
      return res.status(400).json({ error: `collection must be one of: ${allowed.join(', ')}` });
    }
    if (!ObjectId.isValid(itemId)) {
      return res.status(400).json({ error: 'Invalid itemId.' });
    }

    const field = `favorites.${col}`;
    await mongodb.getDatabase().db().collection('users').updateOne(
      { githubId },
      { $pull: { [field]: new ObjectId(itemId) } }
    );

    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: 'Failed to remove favorite.', details: err.message });
  }
};

const getBorrowingHistory = async (req, res) => {
  // #swagger.tags = ['Users']
  try {
    const githubId = getGithubIdFromSession(req);

    const user = await mongodb.getDatabase().db().collection('users').findOne(
      { githubId },
      { projection: { borrowingHistory: 1, _id: 0 } }
    );

    if (!user) return res.status(404).json({ error: 'User record not found.' });

    const { page, limit, skip } = getPagination(req.query, { defaultLimit: 10, maxLimit: 50 });

    const history = Array.isArray(user.borrowingHistory) ? user.borrowingHistory : [];
    const total = history.length;

    // newest first
    const items = history.slice().reverse().slice(skip, skip + limit);

    return res.status(200).json({ page, limit, total, items });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch borrowing history.', details: err.message });
  }
};

module.exports = {
  getMe,
  getLoginHistory,
  listFavorites,
  addFavorite,
  removeFavorite,
  getBorrowingHistory
};
