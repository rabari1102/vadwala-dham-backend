const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');

router.get('/', async (req, res) => {
  try {
    const items = await Announcement.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
