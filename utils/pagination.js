const getPagination = (query, { defaultLimit = 25, maxLimit = 100 } = {}) => {
  const page = Math.max(parseInt(query.page || '1', 10), 1);
  const limitRaw = parseInt(query.limit || String(defaultLimit), 10);
  const limit = Math.min(Math.max(limitRaw, 1), maxLimit);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

module.exports = { getPagination };
