const express = require('express');
const router = express.Router();
const DhajaChadava = require('../models/DhajaChadava');

router.get('/', async (req, res) => {
  try {
    const items = await DhajaChadava.find({ isActive: true }).sort({ order: 1 });
    res.json(items);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
