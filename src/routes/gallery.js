const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');

router.get('/', async (req, res) => {
  try {
    const { category, year } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (year) filter.year = parseInt(year);
    const items = await Gallery.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
